import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const message = this.extractMessage(exception, status)

    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception)
    }

    response.status(status).json({
      statusCode: status,
      message,
    })
  }

  private extractMessage(exception: unknown, status: HttpStatus): string | string[] {
    if (exception instanceof HttpException) {
      const body = exception.getResponse()
      if (typeof body === 'string') return body
      if (typeof body === 'object' && body !== null && 'message' in body) {
        return (body as { message: string | string[] }).message
      }
      return exception.message
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'An unexpected error occurred'
    }

    return 'An error occurred'
  }
}
