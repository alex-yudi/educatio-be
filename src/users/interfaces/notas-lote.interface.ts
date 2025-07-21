export interface ResultadoOperacaoNota {
  sucesso: boolean;
  mensagem: string;
  nota?: {
    id: number;
    valor: number;
    tipo: string;
    criado_em: Date;
    professor_nome: string;
    aluno_nome: string;
    disciplina_nome: string;
    atualizado_em?: Date;
  };
  erro?: string;
}

export interface RespostaLoteNotas {
  total_processadas: number;
  sucessos: number;
  erros: number;
  resultados: ResultadoOperacaoNota[];
}
