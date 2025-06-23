import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class AlunoListEntity {
  @ApiProperty({
    description: 'Lista de alunos',
    type: [UserEntity]
  })
  alunos: UserEntity[];

  @ApiProperty({
    example: 25,
    description: 'Total de alunos encontrados'
  })
  total: number;

  constructor(partial: Partial<AlunoListEntity>) {
    Object.assign(this, partial);
  }
}
