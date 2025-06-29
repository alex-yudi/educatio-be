import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnumPerfil } from '@prisma/client';

@Injectable()
export class ProfessorGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação não fornecido');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token);

      if (payload.role !== EnumPerfil.professor) {
        throw new UnauthorizedException('Acesso restrito a professores');
      }

      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token de autenticação inválido ou expirado');
    }
  }
}
