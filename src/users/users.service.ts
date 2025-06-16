import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EnumPerfil } from '@prisma/client';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { generateRandomPassword } from 'src/utils/password.utils';

// comment: O código abaixo define os serviços de usuários da aplicação. Aqui que realmente ocorrem as requisições e consultas ao banco de dados. O DTO deve ser importado para validar os dados de entrada.
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  create(createUserDto: CreateUserDto) {
    return this.prisma.usuario.create({ data: createUserDto });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.usuario.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }

  async login(loginDto: LoginDto) {
    // Buscar usuário pelo email
    const user = await this.findByEmail(loginDto.email);

    // Verificar se o usuário existe e se a senha está correta
    if (!user || !(await this.comparePasswords(loginDto.senha, user.senha))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    // Retornar token e informações do usuário
    return {
      accessToken: this.jwtService.sign(payload),
      user
    };
  }

  private async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async createProfessor(createProfessorDto: CreateProfessorDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem cadastrar professores');
    }

    // Verificar se já existe um usuário com este e-mail
    const existingUser = await this.findByEmail(createProfessorDto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Gerar senha aleatória
    const temporaryPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    let disciplinaInfo: string | undefined = undefined;
    // Verificar se foi informada uma disciplina
    if (createProfessorDto.disciplina_codigo) {
      // Buscar a disciplina pelo código
      const disciplina = await this.prisma.disciplina.findUnique({
        where: { codigo: createProfessorDto.disciplina_codigo }
      });

      if (!disciplina) {
        throw new NotFoundException(`Disciplina com código ${createProfessorDto.disciplina_codigo} não encontrada`);
      }

      disciplinaInfo = disciplina.nome;
    }

    // Criar o professor
    const novoProfessor = await this.prisma.usuario.create({
      data: {
        nome: createProfessorDto.nome,
        email: createProfessorDto.email,
        senha: hashedPassword,
        role: EnumPerfil.professor
      }
    });

    // Retornar o professor criado e a senha temporária
    return {
      usuario: novoProfessor,
      senha_temporaria: temporaryPassword,
      disciplina: disciplinaInfo
    };
  }
}
