import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EnumPerfil } from '@prisma/client';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateRandomPassword } from 'src/utils/password.utils';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

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

  async createTurma(createTurmaDto: CreateTurmaDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem cadastrar turmas');
    }

    // Verificar se já existe uma turma com este código
    const existingTurma = await this.prisma.turma.findUnique({
      where: { codigo: createTurmaDto.codigo }
    });

    if (existingTurma) {
      throw new ConflictException(`Turma com código ${createTurmaDto.codigo} já existe`);
    }

    // Verificar se a disciplina existe
    const disciplina = await this.prisma.disciplina.findUnique({
      where: { codigo: createTurmaDto.disciplina_codigo }
    });

    if (!disciplina) {
      throw new NotFoundException(`Disciplina com código ${createTurmaDto.disciplina_codigo} não encontrada`);
    }

    // Verificar se o professor existe
    const professor = await this.findByEmail(createTurmaDto.professor_email);
    if (!professor || professor.role !== EnumPerfil.professor) {
      throw new NotFoundException(`Professor com email ${createTurmaDto.professor_email} não encontrado`);
    }

    // Criar a turma
    const novaTurma = await this.prisma.turma.create({
      data: {
        codigo: createTurmaDto.codigo,
        disciplina_id: disciplina.id,
        professor_id: professor.id,
        ano: createTurmaDto.ano,
        semestre: createTurmaDto.semestre,
        sala: createTurmaDto.sala || null,
        vagas: createTurmaDto.vagas || 30
      },
      include: {
        disciplina: true,
        professor: true
      }
    });

    return novaTurma;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem atualizar usuários');
    }

    // Verificar se o usuário existe
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    // Atualizar o usuário
    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: {
        nome: updateUserDto.nome,
        email: updateUserDto.email,
        matricula: updateUserDto.matricula,
        role: updateUserDto.role
      }
    });

    return updatedUser;
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

  // ===== MÉTODOS PARA PROFESSORES =====
  async createProfessor(createProfessorDto: CreateProfessorDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem cadastrar professores');
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await this.findByEmail(createProfessorDto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado no sistema');
    }

    // Gerar senha temporária
    const senhaTemporaria = generateRandomPassword();
    const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

    // Criar professor
    const professor = await this.prisma.usuario.create({
      data: {
        nome: createProfessorDto.nome,
        email: createProfessorDto.email,
        senha: senhaHash,
        role: EnumPerfil.professor
      }
    });

    return {
      ...professor,
      senha_temporaria: senhaTemporaria
    };
  }

  async findAllProfessores() {
    return this.prisma.usuario.findMany({
      where: { role: EnumPerfil.professor },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criado_em: true,
        atualizado_em: true
      }
    });
  }

  async updateProfessor(id: number, updateUserDto: UpdateUserDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem atualizar professores');
    }

    // Verificar se o professor existe
    const professor = await this.findOne(id);
    if (!professor || professor.role !== EnumPerfil.professor) {
      throw new NotFoundException('Professor não encontrado');
    }

    // Verificar se o email não está sendo usado por outro usuário
    if (updateUserDto.email && updateUserDto.email !== professor.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('E-mail já cadastrado no sistema');
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome: updateUserDto.nome || professor.nome,
      email: updateUserDto.email || professor.email
    };

    // Se uma nova senha foi fornecida, fazer hash
    if (updateUserDto.senha) {
      updateData.senha = await bcrypt.hash(updateUserDto.senha, 10);
    }

    // Atualizar professor
    const professorAtualizado = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criado_em: true,
        atualizado_em: true
      }
    });

    return professorAtualizado;
  }

  // ===== MÉTODOS PARA ALUNOS =====
  async findAllAlunos() {
    return this.prisma.usuario.findMany({
      where: { role: EnumPerfil.aluno },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        role: true,
        criado_em: true,
        atualizado_em: true
      }
    });
  }

  async updateAluno(id: number, updateUserDto: UpdateUserDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem atualizar alunos');
    }

    // Verificar se o aluno existe
    const aluno = await this.findOne(id);
    if (!aluno || aluno.role !== EnumPerfil.aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    // Verificar se o email não está sendo usado por outro usuário
    if (updateUserDto.email && updateUserDto.email !== aluno.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('E-mail já cadastrado no sistema');
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome: updateUserDto.nome || aluno.nome,
      email: updateUserDto.email || aluno.email
    };

    // Se uma nova senha foi fornecida, fazer hash
    if (updateUserDto.senha) {
      updateData.senha = await bcrypt.hash(updateUserDto.senha, 10);
    }

    // Atualizar aluno
    const alunoAtualizado = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        role: true,
        criado_em: true,
        atualizado_em: true
      }
    });

    return alunoAtualizado;
  }

  // ===== MÉTODOS PARA DISCIPLINAS =====
  async findAllDisciplinas() {
    return this.prisma.disciplina.findMany({
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    });
  }

  async updateDisciplina(id: number, updateData: Partial<CreateDisciplinaDto>, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem atualizar disciplinas');
    }

    // Verificar se a disciplina existe
    const disciplina = await this.prisma.disciplina.findUnique({
      where: { id }
    });

    if (!disciplina) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    // Verificar se o código não está sendo usado por outra disciplina
    if (updateData.codigo && updateData.codigo !== disciplina.codigo) {
      const existingDisciplina = await this.prisma.disciplina.findUnique({
        where: { codigo: updateData.codigo }
      });
      if (existingDisciplina) {
        throw new ConflictException('Código da disciplina já existe');
      }
    }

    // Atualizar disciplina
    const disciplinaAtualizada = await this.prisma.disciplina.update({
      where: { id },
      data: {
        nome: updateData.nome || disciplina.nome,
        codigo: updateData.codigo || disciplina.codigo,
        descricao: updateData.descricao || disciplina.descricao,
        carga_horaria: updateData.carga_horaria || disciplina.carga_horaria,
        ementa: updateData.ementa || disciplina.ementa
      }
    });

    return disciplinaAtualizada;
  }

  // ===== MÉTODOS PARA TURMAS =====
  async findAllTurmas() {
    return this.prisma.turma.findMany({
      include: {
        disciplina: {
          select: {
            nome: true,
            codigo: true
          }
        },
        professor: {
          select: {
            nome: true,
            email: true
          }
        },
        horarios: true,
        _count: {
          select: {
            matriculas: true
          }
        }
      }
    });
  }

  async updateTurma(id: number, updateData: Partial<CreateTurmaDto>, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem atualizar turmas');
    }

    // Verificar se a turma existe
    const turma = await this.prisma.turma.findUnique({
      where: { id }
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o código não está sendo usado por outra turma
    if (updateData.codigo && updateData.codigo !== turma.codigo) {
      const existingTurma = await this.prisma.turma.findUnique({
        where: { codigo: updateData.codigo }
      });
      if (existingTurma) {
        throw new ConflictException('Código da turma já existe');
      }
    }

    let disciplina_id = turma.disciplina_id;
    let professor_id = turma.professor_id;

    // Se foi fornecido um novo código de disciplina
    if (updateData.disciplina_codigo) {
      const novaDisciplina = await this.prisma.disciplina.findUnique({
        where: { codigo: updateData.disciplina_codigo }
      });
      if (!novaDisciplina) {
        throw new NotFoundException(`Disciplina com código ${updateData.disciplina_codigo} não encontrada`);
      }
      disciplina_id = novaDisciplina.id;
    }

    // Se foi fornecido um novo email de professor
    if (updateData.professor_email) {
      const novoProfessor = await this.findByEmail(updateData.professor_email);
      if (!novoProfessor || novoProfessor.role !== EnumPerfil.professor) {
        throw new NotFoundException(`Professor com email ${updateData.professor_email} não encontrado`);
      }
      professor_id = novoProfessor.id;
    }

    // Atualizar turma
    const turmaAtualizada = await this.prisma.turma.update({
      where: { id },
      data: {
        codigo: updateData.codigo || turma.codigo,
        disciplina_id,
        professor_id,
        ano: updateData.ano || turma.ano,
        semestre: updateData.semestre || turma.semestre,
        sala: updateData.sala !== undefined ? updateData.sala : turma.sala,
        vagas: updateData.vagas || turma.vagas
      },
      include: {
        disciplina: true,
        professor: true
      }
    });

    return turmaAtualizada;
  }
}
