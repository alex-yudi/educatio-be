import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

// comment: O código abaixo é um filtro de exceção para lidar com erros do Prisma Client. Ele captura erros conhecidos do Prisma e retorna respostas apropriadas para o cliente.
@Catch()
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error('Erro Prisma:', exception.code, exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: 'Conflito: dados duplicados encontrados',
          details: message,
        });
        break;
      case 'P2025': // Record not found
        const statusNotFound = HttpStatus.NOT_FOUND;
        response.status(statusNotFound).json({
          statusCode: statusNotFound,
          message: 'Registro não encontrado',
          details: message,
        });
        break;
      case 'P2003': // Foreign key constraint violation
        const statusForeignKey = HttpStatus.BAD_REQUEST;
        response.status(statusForeignKey).json({
          statusCode: statusForeignKey,
          message: 'Erro de relacionamento: operação violaria integridade referencial',
          details: message,
          help: 'Verifique se todos os relacionamentos estão corretos ou se não há dependências que impedem a operação',
        });
        break;
      case 'P2014': // Required relation violation
        const statusRelation = HttpStatus.BAD_REQUEST;
        response.status(statusRelation).json({
          statusCode: statusRelation,
          message: 'Erro de relacionamento obrigatório',
          details: message,
        });
        break;
      default:
        super.catch(exception, host);
        break;
    }
  }
}
