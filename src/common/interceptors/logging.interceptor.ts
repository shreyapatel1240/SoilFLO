import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const { method, url } = request
    const start = Date.now()

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>()
        this.logger.log(`${method} ${url} ${response.statusCode} +${Date.now() - start}ms`)
      }),
    )
  }
}
