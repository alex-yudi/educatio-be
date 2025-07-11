import { ApiProperty } from '@nestjs/swagger';
import { Usuario, EnumPerfil } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

// comment: O código abaixo define uma entidade de usuário que representa um usuário no sistema. Ela usa decorators do class-transformer para definir como os dados devem ser expostos e excluídos ao serializar o objeto. A entidade também implementa a interface Usuario do Prisma, garantindo que ela tenha os mesmos campos definidos no banco de dados.
@Expose()
export class UserEntity implements Usuario {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
  nome: string;
  matricula: string | null;
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
    description: 'Tipo de perfil do usuário',
  })
  role: EnumPerfil;

  @ApiProperty({ required: false, example: '20240001' })
  @Expose({ name: 'matricula' })
  registrationNumber: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
