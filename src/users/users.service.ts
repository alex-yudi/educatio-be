import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EnumPerfil } from '@prisma/client';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { generateRandomPassword } from 'src/utils/password.utils';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { CreateProfessorDto } from './dto/create-professor.dto';

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

  async createMatricula(createMatriculaDto: CreateMatriculaDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem realizar matrículas');
    }

    // Verificar se o aluno existe
    const aluno = await this.findByMatricula(createMatriculaDto.matricula_aluno);
    if (!aluno) {
      throw new NotFoundException(`Aluno com matrícula ${createMatriculaDto.matricula_aluno} não encontrado`);
    }

    // Verificar se o aluno tem o perfil correto
    if (aluno.role !== EnumPerfil.aluno) {
      throw new BadRequestException('O usuário informado não é um aluno');
    }

    // Verificar se a turma existe
    const turma = await this.prisma.turma.findUnique({
      where: { codigo: createMatriculaDto.codigo_turma },
      include: {
        disciplina: true,
        professor: true,
        matriculas: true
      }
    });

    if (!turma) {
      throw new NotFoundException(`Turma com código ${createMatriculaDto.codigo_turma} não encontrada`);
    }

    // Verificar se há vagas disponíveis na turma
    if (turma.matriculas.length >= turma.vagas) {
      throw new BadRequestException(`A turma ${turma.codigo} não possui vagas disponíveis`);
    }

    // Verificar se o aluno já está matriculado nesta turma
    const matriculaExistente = await this.prisma.matricula.findFirst({
      where: {
        estudante_id: aluno.id,
        turma_id: turma.id
      }
    });

    if (matriculaExistente) {
      throw new ConflictException(`O aluno já está matriculado nesta turma`);
    }

    // Criar a matrícula
    const novaMatricula = await this.prisma.matricula.create({
      data: {
        estudante_id: aluno.id,
        turma_id: turma.id,
        status: 'ATIVA'
      }
    });

    // Retornar os dados da matrícula com informações adicionais
    return {
      matricula: novaMatricula,
      aluno: aluno.nome,
      disciplina: turma.disciplina.nome,
      turma: turma.codigo,
      professor: turma.professor.nome
    };
  }

  async createProfessor(createProfessorDto: CreateProfessorDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem cadastrar professores');
    }

    // Verificar se já existe um usuário com este e-mail
    const existingUserByEmail = await this.findByEmail(createProfessorDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Gerar senha aleatória
    const temporaryPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Criar o professor
    const novoProfessor = await this.prisma.usuario.create({
      data: {
        nome: createProfessorDto.nome,
        email: createProfessorDto.email,
        senha: hashedPassword,
        role: EnumPerfil.professor
      }
    });

    // Verificar se foi especificado um código de disciplina
    let disciplinaNome: string | undefined = undefined;
    if (createProfessorDto.disciplina_codigo) {
      const disciplina = await this.prisma.disciplina.findUnique({
        where: { codigo: createProfessorDto.disciplina_codigo }
      });

      if (!disciplina) {
        throw new NotFoundException(`Disciplina com código ${createProfessorDto.disciplina_codigo} não encontrada`);
      }

      // Aqui poderíamos vincular o professor à disciplina se necessário
      disciplinaNome = disciplina.nome;
    }

    // Retornar o professor criado, a senha temporária e a disciplina (se houver)
    return {
      usuario: novoProfessor,
      senha_temporaria: temporaryPassword,
      disciplina: disciplinaNome
    };
  }

  async findAllProfessores(adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem listar professores');
    }

    // Buscar todos os professores
    const professores = await this.prisma.usuario.findMany({
      where: {
        role: EnumPerfil.professor
      },
      orderBy: {
        nome: 'asc'
      }
    });

    return {
      professores,
      total: professores.length
    };
  }

  async findAllAlunos(adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem listar alunos');
    }

    // Buscar todos os alunos
    const alunos = await this.prisma.usuario.findMany({
      where: {
        role: EnumPerfil.aluno
      },
      orderBy: {
        nome: 'asc'
      }
    });

    return {
      alunos,
      total: alunos.length
    };
  }

  async findAllDisciplinas(adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem listar disciplinas');
    }

    // Buscar todas as disciplinas
    const disciplinas = await this.prisma.disciplina.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    return {
      disciplinas,
      total: disciplinas.length
    };
  }

  async findAllTurmas(adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem listar turmas');
    }

    // Buscar todas as turmas
    const turmas = await this.prisma.turma.findMany({
      include: {
        disciplina: true,
        professor: true
      },
      orderBy: {
        codigo: 'asc'
      }
    });

    return {
      turmas: turmas.map(turma => ({
        ...turma,
        disciplina: undefined,
        professor: undefined,
        disciplina_nome: turma.disciplina.nome,
        professor_nome: turma.professor.nome
      })),
      total: turmas.length
    };
  }
}
