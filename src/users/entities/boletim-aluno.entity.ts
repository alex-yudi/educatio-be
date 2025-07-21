import { ApiProperty } from '@nestjs/swagger';
import { NotaResponseEntity } from './nota-response.entity';

export class BoletimAlunoEntity {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do aluno',
  })
  aluno_nome: string;

  @ApiProperty({
    example: '2025001',
    description: 'Matrícula do aluno',
  })
  aluno_matricula: string;

  @ApiProperty({
    example: 'Programação I',
    description: 'Nome da disciplina',
  })
  disciplina_nome: string;

  @ApiProperty({
    example: 'Prof. Maria Santos',
    description: 'Nome do professor',
  })
  professor_nome: string;

  @ApiProperty({
    type: [NotaResponseEntity],
    description: 'Lista de notas do aluno na disciplina',
  })
  notas: NotaResponseEntity[];

  @ApiProperty({
    example: 7.5,
    description: 'Média das 3 unidades (se disponível)',
    nullable: true,
  })
  media_unidades?: number;

  @ApiProperty({
    example: 8.0,
    description: 'Nota final (se aplicável)',
    nullable: true,
  })
  nota_final?: number;

  @ApiProperty({
    example: 'APROVADO',
    description: 'Situação do aluno na disciplina',
  })
  situacao: string;
}
