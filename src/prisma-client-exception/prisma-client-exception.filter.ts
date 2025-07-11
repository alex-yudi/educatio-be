import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

// comment: O código abaixo é um filtro de exceção para lidar com erros do Prisma Client. Ele captura erros conhecidos do Prisma e retorna respostas apropriadas para o cliente.
@Catch()
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002':
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: message,
        });
        break;
      case 'P2025':
        const statusNotFound = HttpStatus.NOT_FOUND;
        response.status(statusNotFound).json({
          statusCode: statusNotFound,
          message: message,
        });
        break;
      default:
        super.catch(exception, host);
        break;
    }
  }
}
