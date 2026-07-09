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
import { ConfigService } from '@nestjs/config'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user'
import { MediaService } from './media.service'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png'])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const dir = process.env.MEDIA_LOCAL_DIR ?? 'uploads'
          cb(null, dir)
        },
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`)
        },
      }),
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

    return this.mediaService.addFromUpload({
      listingId,
      requesterId: user.id,
      filename: file.filename,
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
