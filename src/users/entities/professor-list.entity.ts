import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class ProfessorListEntity {
  @ApiProperty({
    description: 'Lista de professores',
    type: [UserEntity],
  })
  professores: UserEntity[];

  @ApiProperty({
    example: 10,
    description: 'Total de professores encontrados',
  })
  total: number;

  constructor(partial: Partial<ProfessorListEntity>) {
    Object.assign(this, partial);
  }
}
