import { ApiProperty } from '@nestjs/swagger';

export class DeleteResponseEntity {
  @ApiProperty({
    description: 'Mensagem de confirmação da exclusão',
    example: 'Aluno excluído com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Dados do item excluído',
    example: {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
    },
  })
  item_excluido: {
    id: number;
    nome: string;
    email?: string;
    codigo?: string;
    descricao?: string;
    ano?: number;
    semestre?: number;
    disciplina?: string;
    professor?: string;
  };

  constructor(partial: Partial<DeleteResponseEntity>) {
    Object.assign(this, partial);
  }
}
