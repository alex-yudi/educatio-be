import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserEntity } from './user.entity';

@Expose()
export class ProfessorCreatedEntity {
  constructor(partial: Partial<ProfessorCreatedEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    description: 'Usuário professor criado'
  })
  usuario: UserEntity;

  @ApiProperty({
    example: 'Ab1Cd2Ef3',
    description: 'Senha temporária gerada para o primeiro acesso'
  })
  senha_temporaria: string;

  @ApiProperty({
    example: 'Programação I',
    description: 'Nome da disciplina ministrada (se informada)',
    required: false
  })
  @Expose()
  disciplina?: string;
}
