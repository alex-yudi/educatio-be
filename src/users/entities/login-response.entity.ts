import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';

@Expose()
export class LoginResponseEntity {
  constructor(partial: Partial<LoginResponseEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AdW5pLmVkdSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoxNjk4ODU0NDAwfQ.example',
    description:
      'Token JWT para autenticação. Válido por 24 horas. Use no header: Authorization: Bearer {token}',
  })
  accessToken: string;

  @ApiProperty({
    description:
      'Dados completos do usuário autenticado, incluindo perfil e permissões',
    type: UserEntity,
  })
  user: UserEntity;
}
