import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf } from "class-validator";

export enum UserRole {
  CHEFE_DEPARTAMENTO = 'chefeDepartamento',
  PROFESSOR = 'professor',
  ALUNO = 'aluno'
}

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'joao@universidade.com', description: 'E-mail institucional' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senhaSegura123', description: 'Senha com mínimo de 6 caracteres' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.ALUNO,
    description: 'Tipo de usuário: chefeDepartamento, professor ou aluno'
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    required: false,
    example: '202400001',
    description: 'Obrigatório para alunos'
  })
  @ValidateIf(o => o.role === UserRole.ALUNO)
  @IsString()
  @IsNotEmpty()
  matricula?: string;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID do departamento (obrigatório para chefes e professores)'
  })
  @ValidateIf(o => o.role === UserRole.CHEFE_DEPARTAMENTO || o.role === UserRole.PROFESSOR)
  @Type(() => Number)
  @IsNotEmpty()
  departamento_id?: number;
}