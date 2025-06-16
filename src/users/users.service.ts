import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EnumPerfil } from '@prisma/client';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { generateRandomPassword } from 'src/utils/password.utils';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';

// comment: O código abaixo define os serviços de usuários da aplicação,
// mantendo apenas a funcionalidade de login.
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  findByMatricula(matricula: string) {
    return this.prisma.usuario.findUnique({ where: { matricula } });
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

  async createAluno(createAlunoDto: CreateAlunoDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem cadastrar alunos');
    }

    // Verificar se já existe um usuário com este e-mail
    const existingUserByEmail = await this.findByEmail(createAlunoDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Verificar se já existe um usuário com esta matrícula
    const existingUserByMatricula = await this.findByMatricula(createAlunoDto.matricula);
    if (existingUserByMatricula) {
      throw new ConflictException('Matrícula já cadastrada');
    }

    // Verificar se o curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { codigo: createAlunoDto.curso_codigo }
    });

    if (!curso) {
      throw new NotFoundException(`Curso com código ${createAlunoDto.curso_codigo} não encontrado`);
    }

    // Gerar senha aleatória
    const temporaryPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Criar o aluno
    const novoAluno = await this.prisma.usuario.create({
      data: {
        nome: createAlunoDto.nome,
        email: createAlunoDto.email,
        matricula: createAlunoDto.matricula,
        senha: hashedPassword,
        role: EnumPerfil.aluno
      }
    });

    // Retornar o aluno criado, a senha temporária e o curso
    return {
      usuario: novoAluno,
      senha_temporaria: temporaryPassword,
      curso: curso.nome
    };
  }

  async createDisciplina(createDisciplinaDto: CreateDisciplinaDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem cadastrar disciplinas');
    }

    // Verificar se já existe uma disciplina com este código
    const existingDisciplina = await this.prisma.disciplina.findUnique({
      where: { codigo: createDisciplinaDto.codigo }
    });

    if (existingDisciplina) {
      throw new ConflictException(`Disciplina com código ${createDisciplinaDto.codigo} já existe`);
    }

    // Criar a disciplina
    const novaDisciplina = await this.prisma.disciplina.create({
      data: {
        nome: createDisciplinaDto.nome,
        codigo: createDisciplinaDto.codigo,
        descricao: createDisciplinaDto.descricao,
        carga_horaria: createDisciplinaDto.carga_horaria || 60, // Valor padrão se não for fornecido
        ementa: createDisciplinaDto.ementa,
        criado_por: {
          connect: { id: adminId }
        }
      }
    });

    return novaDisciplina;
  }
}
