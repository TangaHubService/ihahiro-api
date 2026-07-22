import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { randomUUID } from 'crypto'
import { extname } from 'path'
import { Readable } from 'stream'
import { AllStorageProvidersFailedError } from './storage.errors'
import { StorageProvider, type UploadableFile, type UploadOptions, type UploadResult } from './storage.types'

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name)
  private readonly s3Client: S3Client
  private readonly s3Bucket: string
  private readonly s3Region: string
  private readonly s3PublicBaseUrl?: string

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    })

    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET', '')
    this.s3Region = this.configService.get<string>('AWS_REGION', 'us-east-1')
    this.s3PublicBaseUrl = this.configService.get<string>('AWS_S3_PUBLIC_BASE_URL')
    this.s3Client = new S3Client({
      region: this.s3Region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    })
  }

  /**
   * Uploads a file to Cloudinary. On any failure it logs the error and falls
   * back to S3 immediately. Only throws once both providers have failed.
   */
  async uploadFile(file: UploadableFile, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const result = await this.uploadToCloudinary(file, options)
      return result
    } catch (cloudinaryError) {
      this.logger.warn(
        `Cloudinary upload failed for "${file.originalname}", falling back to S3: ${this.messageOf(cloudinaryError)}`
      )

      try {
        const result = await this.uploadToS3(file, options)
        return result
      } catch (s3Error) {
        this.logger.error(
          `S3 fallback upload also failed for "${file.originalname}": ${this.messageOf(s3Error)}`
        )
        // Both providers are down — surface a single, distinct error to the caller.
        throw new AllStorageProvidersFailedError(cloudinaryError, s3Error)
      }
    }
  }

  private uploadToCloudinary(file: UploadableFile, options: UploadOptions): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: options.folder, resource_type: 'auto' },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary returned no result'))
            return
          }
          resolve(this.toUploadResult(StorageProvider.CLOUDINARY, result))
        }
      )
      Readable.from(file.buffer).pipe(uploadStream)
    })
  }

  private async uploadToS3(file: UploadableFile, options: UploadOptions): Promise<UploadResult> {
    const key = [options.folder, `${randomUUID()}${extname(file.originalname)}`].filter(Boolean).join('/')

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    )

    const url = this.s3PublicBaseUrl
      ? `${this.s3PublicBaseUrl.replace(/\/$/, '')}/${key}`
      : `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${key}`

    return { success: true, provider: StorageProvider.S3, url, fileId: key }
  }

  private toUploadResult(provider: StorageProvider, result: UploadApiResponse): UploadResult {
    return { success: true, provider, url: result.secure_url, fileId: result.public_id }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(fileId)
    } catch (error) {
      this.logger.warn(`Failed to delete Cloudinary file "${fileId}": ${this.messageOf(error)}`)
    }
  }

  private messageOf(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
  }
}
