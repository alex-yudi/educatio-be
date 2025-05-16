import { ApiProperty } from '@nestjs/swagger';
import { Usuario, EnumPerfil } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Expose()
export class UserEntity implements Usuario {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
  nome: string;
  matricula: string | null;
  departamento_id: number | null;
  senha: string;
  criado_em: Date;
  atualizado_em: Date;

  // Campos originais do Prisma
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'João Silva' })
  @Expose({ name: 'nome' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({
    enum: EnumPerfil,
    example: EnumPerfil.aluno,
    description: 'Tipo de perfil do usuário'
  })
  role: EnumPerfil;

  @ApiProperty({ required: false, example: '20240001' })
  @Expose({ name: 'matricula' })
  registrationNumber: string | null;

  @ApiProperty({ required: false, example: 1 })
  @Expose({ name: 'departamento_id' })
  departmentId: number | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  // Campo virtual para nome do departamento
  @ApiProperty({ required: false, example: 'Ciência da Computação' })
  @Expose()
  departamento?: string;
}