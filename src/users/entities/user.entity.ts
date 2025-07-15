import { ApiProperty } from '@nestjs/swagger';
import { Usuario, EnumPerfil } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Expose()
export class UserEntity implements Usuario {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'João Silva' })
  nome: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @Exclude()
  senha: string;

  @ApiProperty({
    enum: EnumPerfil,
    example: EnumPerfil.aluno,
    description: 'Tipo de perfil do usuário',
  })
  role: EnumPerfil;

  @ApiProperty({ required: false, example: '20240001' })
  matricula: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  criado_em: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  atualizado_em: Date;
}
