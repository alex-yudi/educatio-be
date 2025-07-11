import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class AlunoCreatedEntity {
  @ApiProperty({
    description: 'Dados do aluno criado',
    type: UserEntity,
  })
  usuario: UserEntity;

  @ApiProperty({
    description: 'Senha temporária gerada para o aluno',
    example: 'A1b2C3d4!',
  })
  senha_temporaria: string;

  @ApiProperty({
    description: 'Nome do curso em que o aluno foi matriculado',
    example: 'Engenharia de Software',
  })
  curso: string;

  constructor(partial: Partial<AlunoCreatedEntity>) {
    Object.assign(this, partial);
  }
}
