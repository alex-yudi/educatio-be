import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email do usuário para login'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário com no mínimo 6 caracteres'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;
}
