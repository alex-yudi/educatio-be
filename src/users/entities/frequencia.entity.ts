import { ApiProperty } from '@nestjs/swagger';

export class FrequenciaEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  matricula_id: number;

  @ApiProperty({ example: '2024-06-29T14:00:00.000Z' })
  data_aula: Date;

  @ApiProperty({ example: true })
  presente: boolean;

  @ApiProperty({ example: 1 })
  registrado_por_id: number;

  @ApiProperty({ example: '2024-06-29T14:30:00.000Z' })
  criado_em: Date;

  @ApiProperty({ example: '2024-06-29T14:30:00.000Z' })
  atualizado_em: Date;

  constructor(partial: Partial<FrequenciaEntity>) {
    Object.assign(this, partial);
  }
}
