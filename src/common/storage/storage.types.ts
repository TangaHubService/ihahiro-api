export enum StorageProvider {
  CLOUDINARY = 'cloudinary',
  S3 = 's3',
}

export interface UploadResult {
  success: boolean
  provider: StorageProvider
  url: string
  fileId: string
}

export interface UploadableFile {
  buffer: Buffer
  originalname: string
  mimetype?: string
}

export interface UploadOptions {
  /** Logical folder/prefix to group uploads under (e.g. 'listings', 'avatars'). */
  folder?: string
}
