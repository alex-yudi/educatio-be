import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { EnumPerfil } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não fornecido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Verifica se o usuário tem o perfil de admin
      if (payload.role !== EnumPerfil.admin) {
        throw new UnauthorizedException('Acesso restrito a administradores');
      }

      // Passa o usuário para a requisição
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'Token de autenticação inválido ou expirado',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
