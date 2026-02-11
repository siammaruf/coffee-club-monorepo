import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorCode = (exception as any).code;

    let status = HttpStatus.BAD_REQUEST;
    let messages: string[] = ['Database constraint violation'];
    const detail = (exception as any).detail || '';

    console.log('Database error:', {
      code: (exception as any).code,
      detail: (exception as any).detail,
      constraint: (exception as any).constraint,
      message: exception.message,
      query: (exception as any).query,
    });

    if (errorCode === '23505') {
      // Unique violation in PostgreSQL
      status = HttpStatus.CONFLICT;
      messages = [];

      const columnName = this.extractColumnName(
        detail,
        (exception as any).constraint,
      );
      messages.push(this.getFriendlyMessage(columnName));
    }

    response.status(status).json({
      status: 'error',
      message:
        messages.length === 1 ? messages[0] : 'Multiple validation errors',
      errors: messages.length > 1 ? messages : undefined,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }

  private extractColumnName(detail: string, constraintName: string): string {
    const keyMatch = detail.match(/\(([^)]+)\)/);
    if (keyMatch && keyMatch[1]) {
      return keyMatch[1];
    }

    if (constraintName) {
      const parts = constraintName.split('_');
      if (parts.length > 1) {
        return parts[parts.length - 2];
      }
    }

    return 'field';
  }

  private getFriendlyMessage(columnName: string): string {
    const fieldName = this.formatFieldName(columnName);

    switch (columnName.toLowerCase()) {
      case 'email':
        return 'Email address is already in use';
      case 'phone':
        return 'Phone number is already in use';
      case 'nid_number':
        return 'NID number is already in use';
      case 'username':
        return 'Username is already taken';
      default:
        return `The ${fieldName} already exists`;
    }
  }

  private formatFieldName(field: string): string {
    return field.replace(/_/g, ' ').toLowerCase();
  }
}
