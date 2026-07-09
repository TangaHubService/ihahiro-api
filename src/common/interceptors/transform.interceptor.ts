import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

interface EnvelopedPaginated<T> {
  data: T[]
  meta: unknown
}

function isPaginatedShape(value: unknown): value is { items: unknown[]; meta: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as Record<string, unknown>).items) &&
    typeof (value as Record<string, unknown>).meta === 'object'
  )
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    return next.handle().pipe(
      map((result) => {
        if (result === undefined) {
          return { data: null }
        }

        if (isPaginatedShape(result)) {
          const enveloped: EnvelopedPaginated<unknown> = { data: result.items, meta: result.meta }
          return enveloped
        }

        return { data: result }
      })
    )
  }
}
