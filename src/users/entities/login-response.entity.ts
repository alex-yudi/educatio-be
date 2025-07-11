import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';

@Expose()
export class LoginResponseEntity {
  constructor(partial: Partial<LoginResponseEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de autenticação',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
  })
  user: UserEntity;
}
