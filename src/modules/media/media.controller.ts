import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { FileUploadService } from '@/common/storage/file-upload.service'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { MediaService } from './media.service'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png'])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(new BadRequestException('Only JPEG and PNG images are allowed'), false)
          return
        }
        cb(null, true)
      },
    })
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('listingId') listingId: string,
    @Body('order') order: string | undefined,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!file) throw new BadRequestException('No file uploaded')
    if (!listingId) throw new BadRequestException('listingId is required')

    const result = await this.fileUploadService.uploadFile(
      { buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype },
      { folder: 'listings' }
    )

    return this.mediaService.addFromUpload({
      listingId,
      requesterId: user.id,
      url: result.url,
      fileId: result.fileId,
      order: order !== undefined ? Number(order) : undefined,
    })
  }

  @Public()
  @Get('listing/:listingId')
  list(@Param('listingId') listingId: string) {
    return this.mediaService.list(listingId)
  }

  @Delete(':id/listing/:listingId')
  remove(@Param('id') id: string, @Param('listingId') listingId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaService.remove(id, listingId, user.id)
  }
}
