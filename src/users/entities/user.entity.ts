import { ApiProperty } from '@nestjs/swagger';
import { Usuario, EnumPerfil } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Expose()
export class UserEntity implements Usuario {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    example: 1,
    description: 'ID único do usuário no sistema',
  })
  id: number;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  nome: string;

  @ApiProperty({
    example: 'joao@email.com',
    description: 'E-mail do usuário (usado para login)',
  })
  email: string;

  @Exclude()
  senha: string;

  @ApiProperty({
    enum: EnumPerfil,
    enumName: 'EnumPerfil',
    example: EnumPerfil.aluno,
    description:
      'Perfil/papel do usuário no sistema. Determina as permissões de acesso.',
    examples: {
      admin: {
        value: 'admin',
        description: 'Administrador - acesso total ao sistema',
      },
      professor: {
        value: 'professor',
        description: 'Professor - pode gerenciar suas turmas e frequência',
      },
      aluno: {
        value: 'aluno',
        description: 'Aluno - acesso limitado aos seus dados e notas',
      },
    },
  })
  role: EnumPerfil;

  @ApiProperty({
    required: false,
    example: '2025001',
    description:
      'Número de matrícula (apenas para alunos). Null para admin e professores.',
    nullable: true,
  })
  matricula: string | null;

  @ApiProperty({
    example: '2025-01-15T08:30:00.000Z',
    description: 'Data e hora de criação do registro no formato ISO 8601',
  })
  criado_em: Date;

  @ApiProperty({
    example: '2025-07-14T14:25:00.000Z',
    description:
      'Data e hora da última atualização do registro no formato ISO 8601',
  })
  atualizado_em: Date;
}
