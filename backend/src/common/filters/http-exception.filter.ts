import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'خطای سرور رخ داده است';
    let details: any = null;

    if (exception instanceof HttpException) {
      const resContent = exception.getResponse();
      if (typeof resContent === 'object' && resContent !== null) {
        message = (resContent as any).message || exception.message;
        details = (resContent as any).error || null;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Standardize clear error responses
    response.status(status).json({
      statusCode: status,
      success: false,
      message: Array.isArray(message) ? message.join('، ') : message,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
