import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AdminProfessorGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso requerido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Verifica se o usuário é admin ou professor
      if (payload.role !== 'admin' && payload.role !== 'professor') {
        throw new UnauthorizedException('Acesso restrito a administradores e professores');
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
