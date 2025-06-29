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
import { CreateCursoDto } from './dto/create-curso.dto';
import { LancarFrequenciaDto } from './dto/lancar-frequencia.dto';
import { AlterarFrequenciaDto } from './dto/alterar-frequencia.dto';

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

  // ===== MÉTODOS PARA CURSOS =====
  async createCurso(createCursoDto: CreateCursoDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem cadastrar cursos');
    }

    // Verificar se já existe um curso com este código
    const existingCurso = await this.prisma.curso.findUnique({
      where: { codigo: createCursoDto.codigo }
    });

    if (existingCurso) {
      throw new ConflictException('Código do curso já existe no sistema');
    }

    // Verificar se as disciplinas existem (se fornecidas)
    let disciplinasValidas: any[] = [];
    if (createCursoDto.disciplinas_codigos && createCursoDto.disciplinas_codigos.length > 0) {
      disciplinasValidas = await this.prisma.disciplina.findMany({
        where: {
          codigo: {
            in: createCursoDto.disciplinas_codigos
          }
        }
      });

      if (disciplinasValidas.length !== createCursoDto.disciplinas_codigos.length) {
        const codigosEncontrados = disciplinasValidas.map(d => d.codigo);
        const codigosNaoEncontrados = createCursoDto.disciplinas_codigos.filter(
          codigo => !codigosEncontrados.includes(codigo)
        );
        throw new NotFoundException(`Disciplinas não encontradas: ${codigosNaoEncontrados.join(', ')}`);
      }
    }

    // Criar curso
    const novoCurso = await this.prisma.curso.create({
      data: {
        nome: createCursoDto.nome,
        codigo: createCursoDto.codigo,
        descricao: createCursoDto.descricao || null,
        criado_por_id: adminId
      },
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    });

    // Vincular disciplinas ao curso (se fornecidas)
    if (disciplinasValidas.length > 0) {
      await this.prisma.cursoDisciplina.createMany({
        data: disciplinasValidas.map(disciplina => ({
          curso_id: novoCurso.id,
          disciplina_id: disciplina.id
        }))
      });
    }

    // Buscar curso completo com disciplinas
    const cursoCompleto = await this.prisma.curso.findUnique({
      where: { id: novoCurso.id },
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true
          }
        },
        disciplinas: {
          include: {
            disciplina: {
              select: {
                nome: true,
                codigo: true
              }
            }
          }
        }
      }
    });

    return {
      ...cursoCompleto,
      disciplinas_nomes: cursoCompleto?.disciplinas.map(cd => cd.disciplina.nome) || []
    };
  }

  async findAllCursos() {
    const cursos = await this.prisma.curso.findMany({
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true
          }
        },
        disciplinas: {
          include: {
            disciplina: true
          }
        },
        _count: {
          select: {
            disciplinas: true
          }
        }
      }
    });

    // Para cada curso, contar alunos matriculados
    const cursosComDados = await Promise.all(
      cursos.map(async (curso) => {
        // Contar alunos do curso através das matrículas em turmas das disciplinas do curso
        const alunosCount = await this.prisma.matricula.groupBy({
          by: ['estudante_id'],
          where: {
            turma: {
              disciplina: {
                cursos: {
                  some: {
                    curso_id: curso.id
                  }
                }
              }
            }
          }
        });

        return {
          id: curso.id,
          nome: curso.nome,
          codigo: curso.codigo,
          descricao: curso.descricao,
          total_disciplinas: curso._count.disciplinas,
          total_alunos: alunosCount.length,
          criado_por: curso.criado_por.nome,
          criado_em: curso.criado_em,
          atualizado_em: curso.atualizado_em
        };
      })
    );

    return cursosComDados;
  }

  async updateCurso(id: number, updateData: Partial<CreateCursoDto>, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException('Apenas administradores podem atualizar cursos');
    }

    // Verificar se o curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { id },
      include: {
        disciplinas: true
      }
    });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado');
    }

    // Verificar se o código não está sendo usado por outro curso
    if (updateData.codigo && updateData.codigo !== curso.codigo) {
      const existingCurso = await this.prisma.curso.findUnique({
        where: { codigo: updateData.codigo }
      });
      if (existingCurso) {
        throw new ConflictException('Código do curso já existe');
      }
    }

    // Atualizar dados básicos do curso
    const cursoAtualizado = await this.prisma.curso.update({
      where: { id },
      data: {
        nome: updateData.nome || curso.nome,
        codigo: updateData.codigo || curso.codigo,
        descricao: updateData.descricao !== undefined ? updateData.descricao : curso.descricao
      }
    });

    // Se foram fornecidas novas disciplinas, atualizar relacionamentos
    if (updateData.disciplinas_codigos) {
      // Verificar se as disciplinas existem
      const disciplinasValidas = await this.prisma.disciplina.findMany({
        where: {
          codigo: {
            in: updateData.disciplinas_codigos
          }
        }
      });

      if (disciplinasValidas.length !== updateData.disciplinas_codigos.length) {
        const codigosEncontrados = disciplinasValidas.map(d => d.codigo);
        const codigosNaoEncontrados = updateData.disciplinas_codigos.filter(
          codigo => !codigosEncontrados.includes(codigo)
        );
        throw new NotFoundException(`Disciplinas não encontradas: ${codigosNaoEncontrados.join(', ')}`);
      }

      // Remover relacionamentos existentes
      await this.prisma.cursoDisciplina.deleteMany({
        where: { curso_id: id }
      });

      // Criar novos relacionamentos
      if (disciplinasValidas.length > 0) {
        await this.prisma.cursoDisciplina.createMany({
          data: disciplinasValidas.map(disciplina => ({
            curso_id: id,
            disciplina_id: disciplina.id
          }))
        });
      }
    }

    // Buscar curso atualizado completo
    const cursoCompleto = await this.prisma.curso.findUnique({
      where: { id },
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true
          }
        },
        disciplinas: {
          include: {
            disciplina: {
              select: {
                nome: true,
                codigo: true
              }
            }
          }
        }
      }
    });

    return {
      ...cursoCompleto,
      disciplinas_nomes: cursoCompleto?.disciplinas.map(cd => cd.disciplina.nome) || []
    };
  }

  async findCursoById(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id },
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true
          }
        },
        disciplinas: {
          include: {
            disciplina: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                carga_horaria: true,
                ementa: true
              }
            }
          }
        }
      }
    });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado');
    }

    return {
      ...curso,
      disciplinas_detalhes: curso.disciplinas.map(cd => cd.disciplina)
    };
  }

  async lancarFrequencia(lancarFrequenciaDto: LancarFrequenciaDto, professorId: number) {
    // Verificar se o professor existe
    const professor = await this.findOne(professorId);
    if (!professor || professor.role !== EnumPerfil.professor) {
      throw new UnauthorizedException('Apenas professores podem lançar frequência');
    }

    // Verificar se a turma existe e se o professor é responsável por ela
    const turma = await this.prisma.turma.findUnique({
      where: { id: lancarFrequenciaDto.turma_id },
      include: {
        disciplina: true,
        professor: true,
        matriculas: {
          include: {
            estudante: true
          }
        }
      }
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (turma.professor_id !== professorId) {
      throw new UnauthorizedException('Você só pode lançar frequência para suas próprias turmas');
    }

    // Verificar se já existe frequência para esta data
    const dataAula = new Date(lancarFrequenciaDto.data_aula);
    const frequenciaExistente = await this.prisma.frequencia.findFirst({
      where: {
        matricula: {
          turma_id: turma.id
        },
        data_aula: dataAula
      }
    });

    if (frequenciaExistente) {
      throw new ConflictException(`Frequência já foi lançada para a aula do dia ${dataAula.toLocaleDateString('pt-BR')}`);
    }

    // Validar se todos os alunos presentes estão matriculados na turma
    const matriculasIds = turma.matriculas.map(m => m.estudante_id);
    const alunosInvalidos = lancarFrequenciaDto.alunos_presentes.filter(
      alunoId => !matriculasIds.includes(alunoId)
    );

    if (alunosInvalidos.length > 0) {
      throw new BadRequestException(`Alunos não matriculados na turma: ${alunosInvalidos.join(', ')}`);
    }

    // Preparar dados de frequência para todos os alunos da turma
    const frequenciasData = turma.matriculas.map(matricula => ({
      matricula_id: matricula.id,
      data_aula: dataAula,
      presente: lancarFrequenciaDto.alunos_presentes.includes(matricula.estudante_id),
      registrado_por_id: professorId
    }));

    // Inserir frequências
    await this.prisma.frequencia.createMany({
      data: frequenciasData
    });

    // Preparar resposta
    const alunosPresentes = turma.matriculas
      .filter(m => lancarFrequenciaDto.alunos_presentes.includes(m.estudante_id))
      .map(m => m.estudante.nome);

    const alunosAusentes = turma.matriculas
      .filter(m => !lancarFrequenciaDto.alunos_presentes.includes(m.estudante_id))
      .map(m => m.estudante.nome);

    return {
      message: 'Frequência lançada com sucesso',
      turma_codigo: turma.codigo,
      disciplina_nome: turma.disciplina.nome,
      data_aula: dataAula,
      total_alunos: turma.matriculas.length,
      presentes: alunosPresentes.length,
      ausentes: alunosAusentes.length,
      alunos_presentes: alunosPresentes,
      alunos_ausentes: alunosAusentes,
      registrado_por: professor.nome
    };
  }

  async consultarFrequencia(turmaId: number, professorId: number, dataInicio?: string, dataFim?: string) {
    // Verificar se o professor é responsável pela turma
    const turma = await this.prisma.turma.findUnique({
      where: { id: turmaId },
      include: {
        disciplina: true,
        professor: true
      }
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (turma.professor_id !== professorId) {
      throw new UnauthorizedException('Você só pode consultar frequência de suas próprias turmas');
    }

    // Construir filtros de data
    const whereClause: any = {
      matricula: {
        turma_id: turmaId
      }
    };

    if (dataInicio || dataFim) {
      whereClause.data_aula = {};
      if (dataInicio) {
        whereClause.data_aula.gte = new Date(dataInicio);
      }
      if (dataFim) {
        whereClause.data_aula.lte = new Date(dataFim);
      }
    }

    // Buscar frequências
    const frequencias = await this.prisma.frequencia.findMany({
      where: whereClause,
      include: {
        matricula: {
          include: {
            estudante: {
              select: {
                id: true,
                nome: true,
                matricula: true
              }
            }
          }
        }
      },
      orderBy: [
        { data_aula: 'desc' },
        { matricula: { estudante: { nome: 'asc' } } }
      ]
    });

    // Agrupar por data de aula
    const frequenciasPorData = frequencias.reduce((acc, freq) => {
      const dataKey = freq.data_aula.toISOString().split('T')[0];

      if (!acc[dataKey]) {
        acc[dataKey] = {
          data_aula: freq.data_aula,
          total_alunos: 0,
          presentes: 0,
          ausentes: 0,
          alunos: []
        };
      }

      acc[dataKey].total_alunos++;
      if (freq.presente) {
        acc[dataKey].presentes++;
      } else {
        acc[dataKey].ausentes++;
      }

      acc[dataKey].alunos.push({
        id: freq.matricula.estudante.id,
        nome: freq.matricula.estudante.nome,
        matricula: freq.matricula.estudante.matricula,
        presente: freq.presente
      });

      return acc;
    }, {});

    return {
      turma: {
        id: turma.id,
        codigo: turma.codigo,
        disciplina: turma.disciplina.nome,
        professor: turma.professor.nome
      },
      frequencias: Object.values(frequenciasPorData)
    };
  }

  async alterarFrequencia(alterarFrequenciaDto: AlterarFrequenciaDto, professorId: number) {
    // Verificar se o professor existe
    const professor = await this.findOne(professorId);
    if (!professor || professor.role !== EnumPerfil.professor) {
      throw new UnauthorizedException('Apenas professores podem alterar frequência');
    }

    // Verificar se a turma existe e se o professor é responsável por ela
    const turma = await this.prisma.turma.findUnique({
      where: { id: alterarFrequenciaDto.turma_id },
      include: {
        disciplina: true,
        professor: true,
        matriculas: {
          include: {
            estudante: true
          }
        }
      }
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (turma.professor_id !== professorId) {
      throw new UnauthorizedException('Você só pode alterar frequência de suas próprias turmas');
    }

    const dataAula = new Date(alterarFrequenciaDto.data_aula);

    // Verificar se existe frequência para esta data
    const frequenciasExistentes = await this.prisma.frequencia.findMany({
      where: {
        matricula: {
          turma_id: turma.id
        },
        data_aula: dataAula
      },
      include: {
        matricula: {
          include: {
            estudante: true
          }
        }
      }
    });

    if (frequenciasExistentes.length === 0) {
      throw new NotFoundException(`Não existe frequência registrada para a aula do dia ${dataAula.toLocaleDateString('pt-BR')}`);
    }

    // Validar se todos os alunos das alterações estão matriculados na turma
    const matriculasIds = turma.matriculas.map(m => m.estudante_id);
    const alunosAlteracoes = alterarFrequenciaDto.alteracoes.map(a => a.aluno_id);
    const alunosInvalidos = alunosAlteracoes.filter(alunoId => !matriculasIds.includes(alunoId));

    if (alunosInvalidos.length > 0) {
      throw new BadRequestException(`Alunos não matriculados na turma: ${alunosInvalidos.join(', ')}`);
    }

    // Preparar as alterações e buscar status anterior
    const detalhesAlteracoes: any[] = [];

    for (const alteracao of alterarFrequenciaDto.alteracoes) {
      // Buscar a frequência atual do aluno
      const frequenciaAtual = frequenciasExistentes.find(f =>
        f.matricula.estudante_id === alteracao.aluno_id
      );

      if (!frequenciaAtual) {
        throw new NotFoundException(`Frequência não encontrada para o aluno ID ${alteracao.aluno_id}`);
      }

      // Só atualizar se o status mudou
      if (frequenciaAtual.presente !== alteracao.presente) {
        await this.prisma.frequencia.update({
          where: { id: frequenciaAtual.id },
          data: {
            presente: alteracao.presente,
            registrado_por_id: professorId,
            atualizado_em: new Date()
          }
        });

        // Adicionar aos detalhes
        const statusAnterior = frequenciaAtual.presente ? 'Presente' : 'Ausente';
        const statusNovo = alteracao.presente ? 'Presente' : 'Ausente';

        detalhesAlteracoes.push({
          aluno_id: alteracao.aluno_id,
          aluno_nome: frequenciaAtual.matricula.estudante.nome,
          matricula: frequenciaAtual.matricula.estudante.matricula,
          status_anterior: frequenciaAtual.presente,
          status_novo: alteracao.presente,
          alteracao: `${statusAnterior} → ${statusNovo}`
        });
      }
    }

    if (detalhesAlteracoes.length === 0) {
      throw new BadRequestException('Nenhuma alteração foi necessária. Os status informados já são os atuais.');
    }

    // Buscar frequências atualizadas para estatísticas finais
    const frequenciasAtualizadas = await this.prisma.frequencia.findMany({
      where: {
        matricula: {
          turma_id: turma.id
        },
        data_aula: dataAula
      },
      include: {
        matricula: {
          include: {
            estudante: true
          }
        }
      }
    });

    const presentesFinal = frequenciasAtualizadas.filter(f => f.presente).length;
    const ausentesFinal = frequenciasAtualizadas.filter(f => !f.presente).length;

    return {
      message: 'Frequência alterada com sucesso',
      turma_codigo: turma.codigo,
      disciplina_nome: turma.disciplina.nome,
      data_aula: dataAula,
      total_alteracoes: detalhesAlteracoes.length,
      presentes_final: presentesFinal,
      ausentes_final: ausentesFinal,
      detalhes_alteracoes: detalhesAlteracoes,
      alterado_por: professor.nome,
      data_alteracao: new Date()
    };
  }
}
