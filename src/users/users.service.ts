import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { DesmatricularAlunoDto } from './dto/desmatricular-aluno.dto';
import { LancarNotaDto, TipoNota } from './dto/lancar-nota.dto';
import { AlterarNotaDto } from './dto/alterar-nota.dto';
import { LancarNotasLoteDto } from './dto/lancar-notas-lote.dto';
import { AlterarNotasLoteDto } from './dto/alterar-notas-lote.dto';
import { ResultadoOperacaoNota, RespostaLoteNotas } from './interfaces/notas-lote.interface';

// comment: O código abaixo define os serviços de usuários da aplicação,
// mantendo apenas a funcionalidade de login.
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  /**
   * Valida se o usuário é um administrador
   * @param adminId ID do usuário que deve ser admin
   * @throws UnauthorizedException se o usuário não for admin
   */
  private async validateAdmin(adminId: number): Promise<void> {
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException(
        'Apenas administradores podem realizar esta operação',
      );
    }
  }

  /**
   * Valida se o usuário é um professor
   * @param professorId ID do usuário que deve ser professor
   * @throws UnauthorizedException se o usuário não for professor
   */
  private async validateProfessor(professorId: number): Promise<void> {
    const professor = await this.findOne(professorId);
    if (!professor || professor.role !== EnumPerfil.professor) {
      throw new UnauthorizedException(
        'Apenas professores podem realizar esta operação',
      );
    }
  }

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
      role: user.role,
    };

    // Retornar token e informações do usuário
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async verifyToken(token: string) {
    const payload = this.jwtService.verify<{
      sub: number;
      email: string;
      role: EnumPerfil;
    }>(token);

    const user = await this.findOne(payload.sub);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado para token jwt');
    }

    return user;
  }

  private async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async createAluno(createAlunoDto: CreateAlunoDto, adminId: number) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

    // Verificar se já existe um usuário com este e-mail
    const existingUserByEmail = await this.findByEmail(createAlunoDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Verificar se já existe um usuário com esta matrícula
    const existingUserByMatricula = await this.findByMatricula(
      createAlunoDto.matricula,
    );
    if (existingUserByMatricula) {
      throw new ConflictException('Matrícula já cadastrada');
    }

    // Verificar se o curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { codigo: createAlunoDto.curso_codigo },
    });

    if (!curso) {
      throw new NotFoundException(
        `Curso com código ${createAlunoDto.curso_codigo} não encontrado`,
      );
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
        role: EnumPerfil.aluno,
      },
    });

    // Retornar o aluno criado, a senha temporária e o curso
    return {
      usuario: novoAluno,
      senha_temporaria: temporaryPassword,
      curso: curso.nome,
    };
  }

  async createTurma(createTurmaDto: CreateTurmaDto, adminId: number) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException(
        'Apenas administradores podem cadastrar turmas',
      );
    }

    // Verificar se já existe uma turma com este código
    const existingTurma = await this.prisma.turma.findUnique({
      where: { codigo: createTurmaDto.codigo },
    });

    if (existingTurma) {
      throw new ConflictException(
        `Turma com código ${createTurmaDto.codigo} já existe`,
      );
    }

    // Verificar se a disciplina existe
    const disciplina = await this.prisma.disciplina.findUnique({
      where: { codigo: createTurmaDto.disciplina_codigo },
    });

    if (!disciplina) {
      throw new NotFoundException(
        `Disciplina com código ${createTurmaDto.disciplina_codigo} não encontrada`,
      );
    }

    // Verificar se o professor existe
    const professor = await this.findByEmail(createTurmaDto.professor_email);
    if (!professor || professor.role !== EnumPerfil.professor) {
      throw new NotFoundException(
        `Professor com email ${createTurmaDto.professor_email} não encontrado`,
      );
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
        vagas: createTurmaDto.vagas || 30,
      },
      include: {
        disciplina: true,
        professor: true,
      },
    });

    return novaTurma;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto, adminId: number) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

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
        role: updateUserDto.role,
      },
    });

    return updatedUser;
  }

  async createDisciplina(
    createDisciplinaDto: CreateDisciplinaDto,
    adminId: number,
  ) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

    // Verificar se já existe uma disciplina com este código
    const existingDisciplina = await this.prisma.disciplina.findUnique({
      where: { codigo: createDisciplinaDto.codigo },
    });

    if (existingDisciplina) {
      throw new ConflictException(
        `Disciplina com código ${createDisciplinaDto.codigo} já existe`,
      );
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
          connect: { id: adminId },
        },
      },
    });

    return novaDisciplina;
  }

  async createMatricula(
    createMatriculaDto: CreateMatriculaDto,
    adminId: number,
  ) {
    // 1. Validar se o usuário é um administrador
    await this.validateAdmin(adminId);

    const { codigo_turma, matriculas_alunos } = createMatriculaDto;

    // Garante que não há matrículas duplicadas na requisição
    const matriculasDesejadasUnicas = [...new Set(matriculas_alunos)];

    // 2. Buscar a turma e suas matrículas atuais
    const turma = await this.prisma.turma.findUnique({
      where: { codigo: codigo_turma },
      include: {
        matriculas: {
          select: {
            id: true,
            estudante_id: true,
          },
        },
      },
    });

    if (!turma) {
      throw new NotFoundException(
        `Turma com código ${codigo_turma} não encontrada`,
      );
    }

    // 3. Validar os alunos da lista de entrada e obter seus IDs
    const alunosDesejados = await this.prisma.usuario.findMany({
      where: {
        matricula: { in: matriculasDesejadasUnicas },
        role: EnumPerfil.aluno,
      },
      select: { id: true, matricula: true },
    });

    // Verificar se todas as matrículas fornecidas correspondem a alunos válidos
    if (alunosDesejados.length !== matriculasDesejadasUnicas.length) {
      const matriculasEncontradas = new Set(
        alunosDesejados.map((a) => a.matricula!),
      );
      const matriculasFaltantes = matriculasDesejadasUnicas.filter(
        (m) => !matriculasEncontradas.has(m),
      );
      throw new NotFoundException(
        `Os seguintes alunos não foram encontrados ou não são válidos: ${matriculasFaltantes.join(
          ', ',
        )}`,
      );
    }

    const idsAlunosDesejados = new Set(
      alunosDesejados.map((aluno) => aluno.id),
    );
    const idsAlunosAtuais = new Set(
      turma.matriculas.map((m) => m.estudante_id),
    );

    // 4. Determinar quais alunos matricular e quais desmatricular
    // Alunos para matricular: estão na lista desejada mas não na atual
    const idsAlunosParaMatricular = [...idsAlunosDesejados].filter(
      (id) => !idsAlunosAtuais.has(id),
    );

    // Matrículas para remover: alunos na lista atual que não estão na desejada
    const matriculasParaRemover = turma.matriculas.filter(
      (m) => !idsAlunosDesejados.has(m.estudante_id),
    );
    const idsMatriculasParaRemover = matriculasParaRemover.map((m) => m.id);

    // 5. Verificar a capacidade da turma
    const numMatriculasFinal =
      idsAlunosAtuais.size -
      idsMatriculasParaRemover.length +
      idsAlunosParaMatricular.length;

    if (numMatriculasFinal > turma.vagas) {
      throw new BadRequestException(
        `A operação excede o número de vagas (${turma.vagas}) da turma. O número final de alunos seria ${numMatriculasFinal}.`,
      );
    }

    // 6. Executar as operações de remoção e criação em uma transação
    const [removidas, criadas] = await this.prisma.$transaction([
      // Desmatricular alunos que não estão na lista
      this.prisma.matricula.deleteMany({
        where: {
          id: { in: idsMatriculasParaRemover },
        },
      }),
      // Matricular novos alunos
      this.prisma.matricula.createMany({
        data: idsAlunosParaMatricular.map((alunoId) => ({
          estudante_id: alunoId,
          turma_id: turma.id,
          status: 'ATIVA',
        })),
      }),
    ]);

    // 7. Retornar um resumo da operação
    return {
      message: 'Matrículas sincronizadas com sucesso.',
      turma: codigo_turma,
      matriculas_adicionadas: criadas.count,
      matriculas_removidas: removidas.count,
      total_alunos_turma: numMatriculasFinal,
    };
  }

  // ===== MÉTODOS PARA PROFESSORES =====
  async createProfessor(
    createProfessorDto: CreateProfessorDto,
    adminId: number,
  ) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

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
        role: EnumPerfil.professor,
      },
    });

    return {
      ...professor,
      senha_temporaria: senhaTemporaria,
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
        atualizado_em: true,
        turmasMinistradas: {
          select: {
            id: true,
            codigo: true,
            ano: true,
            semestre: true,
            vagas: true,
            sala: true,
            disciplina: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                carga_horaria: true,
              },
            },
            matriculas: {
              select: {
                estudante: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                    matricula: true,
                  },
                },
                status: true,
              },
            },
            horarios: {
              select: {
                dia_semana: true,
                hora_inicio: true,
                hora_fim: true,
              },
            },
          },
        },
      },
    });
  }

  async findProfessorById(id: number) {
    const professor = await this.prisma.usuario.findUnique({
      where: {
        id,
        role: EnumPerfil.professor,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criado_em: true,
        atualizado_em: true,
        turmasMinistradas: {
          select: {
            id: true,
            codigo: true,
            ano: true,
            semestre: true,
            vagas: true,
            sala: true,
            disciplina: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                carga_horaria: true,
              },
            },
            matriculas: {
              select: {
                estudante: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                    matricula: true,
                  },
                },
                status: true,
              },
            },
            horarios: {
              select: {
                dia_semana: true,
                hora_inicio: true,
                hora_fim: true,
              },
            },
          },
        },
      },
    });

    if (!professor) {
      throw new NotFoundException('Professor não encontrado');
    }

    return professor;
  }

  async updateProfessor(
    id: number,
    updateUserDto: UpdateUserDto,
    adminId: number,
  ) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

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
      email: updateUserDto.email || professor.email,
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
        atualizado_em: true,
      },
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
        atualizado_em: true,
        matriculas: {
          select: {
            id: true,
            status: true,
            criado_em: true,
            turma: {
              select: {
                id: true,
                codigo: true,
                ano: true,
                semestre: true,
                sala: true,
                disciplina: {
                  select: {
                    id: true,
                    nome: true,
                    codigo: true,
                    carga_horaria: true,
                  },
                },
                professor: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAlunoById(id: number) {
    const aluno = await this.prisma.usuario.findUnique({
      where: {
        id,
        role: EnumPerfil.aluno,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        role: true,
        criado_em: true,
        atualizado_em: true,
        matriculas: {
          select: {
            id: true,
            status: true,
            criado_em: true,
            turma: {
              select: {
                id: true,
                codigo: true,
                ano: true,
                semestre: true,
                sala: true,
                disciplina: {
                  select: {
                    id: true,
                    nome: true,
                    codigo: true,
                    carga_horaria: true,
                  },
                },
                professor: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return aluno;
  }

  async updateAluno(id: number, updateUserDto: UpdateUserDto, adminId: number) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

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
      email: updateUserDto.email || aluno.email,
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
        atualizado_em: true,
      },
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
            email: true,
          },
        },
      },
    });
  }

  async findDisciplinaById(id: number) {
    const disciplina = await this.prisma.disciplina.findUnique({
      where: { id },
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!disciplina) {
      throw new NotFoundException('Curso não encontrado');
    }

    return {
      ...disciplina,
    };
  }

  async updateDisciplina(
    id: number,
    updateData: Partial<CreateDisciplinaDto>,
    adminId: number,
  ) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

    // Verificar se a disciplina existe
    const disciplina = await this.prisma.disciplina.findUnique({
      where: { id },
    });

    if (!disciplina) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    // Verificar se o código não está sendo usado por outra disciplina
    if (updateData.codigo && updateData.codigo !== disciplina.codigo) {
      const existingDisciplina = await this.prisma.disciplina.findUnique({
        where: { codigo: updateData.codigo },
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
        ementa: updateData.ementa || disciplina.ementa,
      },
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
            codigo: true,
          },
        },
        professor: {
          select: {
            nome: true,
            email: true,
          },
        },
        matriculas: {
          select: {
            id: true,
            status: true,
            estudante: {
              select: {
                id: true,
                nome: true,
                email: true,
                matricula: true,
              },
            },
            criado_em: true,
          },
        },
        horarios: true,
        _count: {
          select: {
            matriculas: true,
          },
        },
      },
    });
  }
  async findTurmasProfessor(professorId: number) {
    return this.prisma.turma.findMany({
      where: {
        professor_id: professorId,
      },
      include: {
        disciplina: {
          select: {
            nome: true,
            codigo: true,
          },
        },
        professor: {
          select: {
            nome: true,
            email: true,
          },
        },
        matriculas: {
          select: {
            id: true,
            status: true,
            estudante: {
              select: {
                id: true,
                nome: true,
                email: true,
                matricula: true,
              },
            },
            criado_em: true,
          },
        },
        horarios: true,
        _count: {
          select: {
            matriculas: true,
          },
        },
      },
    });
  }

  // ===== MÉTODO PARA BUSCAR TURMA POR ID =====
  async findTurmaById(id: number) {
    return this.prisma.turma.findUnique({
      where: { id },
      include: {
        disciplina: {
          select: {
            id: true,
            nome: true,
            codigo: true,
            carga_horaria: true,
            descricao: true,
          },
        },
        professor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        matriculas: {
          select: {
            id: true,
            status: true,
            estudante: {
              select: {
                id: true,
                nome: true,
                email: true,
                matricula: true,
              },
            },
            criado_em: true,
          },
        },
        horarios: {
          select: {
            id: true,
            dia_semana: true,
            hora_inicio: true,
            hora_fim: true,
          },
        },
        _count: {
          select: {
            matriculas: true,
          },
        },
      },
    });
  }

  async updateTurma(
    id: number,
    updateData: Partial<CreateTurmaDto>,
    adminId: number,
  ) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

    // Verificar se a turma existe
    const turma = await this.prisma.turma.findUnique({
      where: { id },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o código não está sendo usado por outra turma
    if (updateData.codigo && updateData.codigo !== turma.codigo) {
      const existingTurma = await this.prisma.turma.findUnique({
        where: { codigo: updateData.codigo },
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
        where: { codigo: updateData.disciplina_codigo },
      });
      if (!novaDisciplina) {
        throw new NotFoundException(
          `Disciplina com código ${updateData.disciplina_codigo} não encontrada`,
        );
      }
      disciplina_id = novaDisciplina.id;
    }

    // Se foi fornecido um novo email de professor
    if (updateData.professor_email) {
      const novoProfessor = await this.findByEmail(updateData.professor_email);
      if (!novoProfessor || novoProfessor.role !== EnumPerfil.professor) {
        throw new NotFoundException(
          `Professor com email ${updateData.professor_email} não encontrado`,
        );
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
        vagas: updateData.vagas || turma.vagas,
      },
      include: {
        disciplina: true,
        professor: true,
      },
    });

    return turmaAtualizada;
  }

  // ===== MÉTODOS PARA CURSOS =====
  async createCurso(createCursoDto: CreateCursoDto, adminId: number) {
    // Verificar se o admin existe
    await this.validateAdmin(adminId);

    // Verificar se já existe um curso com este código
    const existingCurso = await this.prisma.curso.findUnique({
      where: { codigo: createCursoDto.codigo },
    });

    if (existingCurso) {
      throw new ConflictException('Código do curso já existe no sistema');
    }

    // Verificar se as disciplinas existem (se fornecidas)
    let disciplinasValidas: any[] = [];
    if (
      createCursoDto.disciplinas_codigos &&
      createCursoDto.disciplinas_codigos.length > 0
    ) {
      disciplinasValidas = await this.prisma.disciplina.findMany({
        where: {
          codigo: {
            in: createCursoDto.disciplinas_codigos,
          },
        },
      });

      if (
        disciplinasValidas.length !== createCursoDto.disciplinas_codigos.length
      ) {
        const codigosEncontrados = disciplinasValidas.map((d) => d.codigo);
        const codigosNaoEncontrados = createCursoDto.disciplinas_codigos.filter(
          (codigo) => !codigosEncontrados.includes(codigo),
        );
        throw new NotFoundException(
          `Disciplinas não encontradas: ${codigosNaoEncontrados.join(', ')}`,
        );
      }
    }

    // Criar curso
    const novoCurso = await this.prisma.curso.create({
      data: {
        nome: createCursoDto.nome,
        codigo: createCursoDto.codigo,
        descricao: createCursoDto.descricao || null,
        criado_por_id: adminId,
      },
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    // Vincular disciplinas ao curso (se fornecidas)
    if (disciplinasValidas.length > 0) {
      await this.prisma.cursoDisciplina.createMany({
        data: disciplinasValidas.map((disciplina) => ({
          curso_id: novoCurso.id,
          disciplina_id: disciplina.id,
        })),
      });
    }

    // Buscar curso completo com disciplinas
    const cursoCompleto = await this.prisma.curso.findUnique({
      where: { id: novoCurso.id },
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true,
          },
        },
        disciplinas: {
          include: {
            disciplina: {
              select: {
                nome: true,
                codigo: true,
              },
            },
          },
        },
      },
    });

    return {
      ...cursoCompleto,
      disciplinas_nomes:
        cursoCompleto?.disciplinas.map((cd) => cd.disciplina.nome) || [],
    };
  }

  async findAllCursos() {
    const cursos = await this.prisma.curso.findMany({
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true,
          },
        },
        disciplinas: {
          include: {
            disciplina: true,
          },
        },
        _count: {
          select: {
            disciplinas: true,
          },
        },
      },
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
                    curso_id: curso.id,
                  },
                },
              },
            },
          },
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
          atualizado_em: curso.atualizado_em,
        };
      }),
    );

    return cursosComDados;
  }

  async updateCurso(
    id: number,
    updateData: Partial<CreateCursoDto>,
    adminId: number,
  ) {
    // Verificar se o admin existe
    const admin = await this.findOne(adminId);
    if (!admin || admin.role !== EnumPerfil.admin) {
      throw new UnauthorizedException(
        'Apenas administradores podem atualizar cursos',
      );
    }

    // Verificar se o curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { id },
      include: {
        disciplinas: true,
      },
    });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado');
    }

    // Verificar se o código não está sendo usado por outro curso
    if (updateData.codigo && updateData.codigo !== curso.codigo) {
      const existingCurso = await this.prisma.curso.findUnique({
        where: { codigo: updateData.codigo },
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
        descricao:
          updateData.descricao !== undefined
            ? updateData.descricao
            : curso.descricao,
      },
    });

    // Se foram fornecidas novas disciplinas, atualizar relacionamentos
    if (updateData.disciplinas_codigos) {
      // Verificar se as disciplinas existem
      const disciplinasValidas = await this.prisma.disciplina.findMany({
        where: {
          codigo: {
            in: updateData.disciplinas_codigos,
          },
        },
      });

      if (disciplinasValidas.length !== updateData.disciplinas_codigos.length) {
        const codigosEncontrados = disciplinasValidas.map((d) => d.codigo);
        const codigosNaoEncontrados = updateData.disciplinas_codigos.filter(
          (codigo) => !codigosEncontrados.includes(codigo),
        );
        throw new NotFoundException(
          `Disciplinas não encontradas: ${codigosNaoEncontrados.join(', ')}`,
        );
      }

      // Remover relacionamentos existentes
      await this.prisma.cursoDisciplina.deleteMany({
        where: { curso_id: id },
      });

      // Criar novos relacionamentos
      if (disciplinasValidas.length > 0) {
        await this.prisma.cursoDisciplina.createMany({
          data: disciplinasValidas.map((disciplina) => ({
            curso_id: id,
            disciplina_id: disciplina.id,
          })),
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
            email: true,
          },
        },
        disciplinas: {
          include: {
            disciplina: {
              select: {
                nome: true,
                codigo: true,
              },
            },
          },
        },
      },
    });

    return {
      ...cursoCompleto,
      disciplinas_nomes:
        cursoCompleto?.disciplinas.map((cd) => cd.disciplina.nome) || [],
    };
  }

  async findCursoById(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id },
      include: {
        criado_por: {
          select: {
            nome: true,
            email: true,
          },
        },
        disciplinas: {
          include: {
            disciplina: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                carga_horaria: true,
                ementa: true,
              },
            },
          },
        },
      },
    });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado');
    }

    return {
      ...curso,
      disciplinas_detalhes: curso.disciplinas.map((cd) => cd.disciplina),
    };
  }

  async lancarFrequencia(
    lancarFrequenciaDto: LancarFrequenciaDto,
    professorId: number,
  ) {
    // Verificar se o professor existe
    await this.validateProfessor(professorId);
    const professor = await this.findOne(professorId);

    // Verificar se a turma existe e se o professor é responsável por ela
    const turma = await this.prisma.turma.findUnique({
      where: { id: lancarFrequenciaDto.turma_id },
      include: {
        disciplina: true,
        professor: true,
        matriculas: {
          include: {
            estudante: true,
          },
        },
      },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (turma.professor_id !== professorId) {
      throw new UnauthorizedException(
        'Você só pode lançar frequência para suas próprias turmas',
      );
    }

    // Verificar se já existe frequência para esta data
    const dataAula = new Date(lancarFrequenciaDto.data_aula);
    const frequenciaExistente = await this.prisma.frequencia.findFirst({
      where: {
        matricula: {
          turma_id: turma.id,
        },
        data_aula: dataAula,
      },
    });

    if (frequenciaExistente) {
      throw new ConflictException(
        `Frequência já foi lançada para a aula do dia ${dataAula.toLocaleDateString('pt-BR')}`,
      );
    }

    // Validar se todos os alunos presentes estão matriculados na turma
    const matriculasIds = turma.matriculas.map((m) => m.estudante_id);
    const alunosInvalidos = lancarFrequenciaDto.alunos_presentes.filter(
      (alunoId) => !matriculasIds.includes(alunoId),
    );

    if (alunosInvalidos.length > 0) {
      throw new BadRequestException(
        `Alunos não matriculados na turma: ${alunosInvalidos.join(', ')}`,
      );
    }

    // Preparar dados de frequência para todos os alunos da turma
    const frequenciasData = turma.matriculas.map((matricula) => ({
      matricula_id: matricula.id,
      data_aula: dataAula,
      presente: lancarFrequenciaDto.alunos_presentes.includes(
        matricula.estudante_id,
      ),
      registrado_por_id: professorId,
    }));

    // Inserir frequências
    await this.prisma.frequencia.createMany({
      data: frequenciasData,
    });

    // Preparar resposta
    const alunosPresentes = turma.matriculas
      .filter((m) =>
        lancarFrequenciaDto.alunos_presentes.includes(m.estudante_id),
      )
      .map((m) => m.estudante.nome);

    const alunosAusentes = turma.matriculas
      .filter(
        (m) => !lancarFrequenciaDto.alunos_presentes.includes(m.estudante_id),
      )
      .map((m) => m.estudante.nome);

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
      registrado_por: professor!.nome,
    };
  }

  async consultarFrequencia(
    turmaId: number,
    professorId: number,
    dataInicio?: string,
    dataFim?: string,
  ) {
    // Verificar se o professor é responsável pela turma
    const turma = await this.prisma.turma.findUnique({
      where: { id: turmaId },
      include: {
        disciplina: true,
        professor: true,
      },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (turma.professor_id !== professorId) {
      throw new UnauthorizedException(
        'Você só pode consultar frequência de suas próprias turmas',
      );
    }

    // Construir filtros de data
    const whereClause: any = {
      matricula: {
        turma_id: turmaId,
      },
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
                matricula: true,
              },
            },
          },
        },
      },
      orderBy: [
        { data_aula: 'desc' },
        { matricula: { estudante: { nome: 'asc' } } },
      ],
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
          alunos: [],
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
        presente: freq.presente,
      });

      return acc;
    }, {});

    return {
      turma: {
        id: turma.id,
        codigo: turma.codigo,
        disciplina: turma.disciplina.nome,
        professor: turma.professor.nome,
      },
      frequencias: Object.values(frequenciasPorData),
    };
  }

  async alterarFrequencia(
    alterarFrequenciaDto: AlterarFrequenciaDto,
    professorId: number,
  ) {
    // Verificar se o professor existe
    const professor = await this.findOne(professorId);
    if (!professor || professor.role !== EnumPerfil.professor) {
      throw new UnauthorizedException(
        'Apenas professores podem alterar frequência',
      );
    }

    // Verificar se a turma existe e se o professor é responsável por ela
    const turma = await this.prisma.turma.findUnique({
      where: { id: alterarFrequenciaDto.turma_id },
      include: {
        disciplina: true,
        professor: true,
        matriculas: {
          include: {
            estudante: true,
          },
        },
      },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (turma.professor_id !== professorId) {
      throw new UnauthorizedException(
        'Você só pode alterar frequência de suas próprias turmas',
      );
    }

    const dataAula = new Date(alterarFrequenciaDto.data_aula);

    // Verificar se existe frequência para esta data
    const frequenciasExistentes = await this.prisma.frequencia.findMany({
      where: {
        matricula: {
          turma_id: turma.id,
        },
        data_aula: dataAula,
      },
      include: {
        matricula: {
          include: {
            estudante: true,
          },
        },
      },
    });

    if (frequenciasExistentes.length === 0) {
      throw new NotFoundException(
        `Não existe frequência registrada para a aula do dia ${dataAula.toLocaleDateString('pt-BR')}`,
      );
    }

    // Validar se todos os alunos das alterações estão matriculados na turma
    const matriculasIds = turma.matriculas.map((m) => m.estudante_id);
    const alunosAlteracoes = alterarFrequenciaDto.alteracoes.map(
      (a) => a.aluno_id,
    );
    const alunosInvalidos = alunosAlteracoes.filter(
      (alunoId) => !matriculasIds.includes(alunoId),
    );

    if (alunosInvalidos.length > 0) {
      throw new BadRequestException(
        `Alunos não matriculados na turma: ${alunosInvalidos.join(', ')}`,
      );
    }

    // Preparar as alterações e buscar status anterior
    const detalhesAlteracoes: any[] = [];

    for (const alteracao of alterarFrequenciaDto.alteracoes) {
      // Buscar a frequência atual do aluno
      const frequenciaAtual = frequenciasExistentes.find(
        (f) => f.matricula.estudante_id === alteracao.aluno_id,
      );

      if (!frequenciaAtual) {
        throw new NotFoundException(
          `Frequência não encontrada para o aluno ID ${alteracao.aluno_id}`,
        );
      }

      // Só atualizar se o status mudou
      if (frequenciaAtual.presente !== alteracao.presente) {
        await this.prisma.frequencia.update({
          where: { id: frequenciaAtual.id },
          data: {
            presente: alteracao.presente,
            registrado_por_id: professorId,
            atualizado_em: new Date(),
          },
        });

        // Adicionar aos detalhes
        const statusAnterior = frequenciaAtual.presente
          ? 'Presente'
          : 'Ausente';
        const statusNovo = alteracao.presente ? 'Presente' : 'Ausente';

        detalhesAlteracoes.push({
          aluno_id: alteracao.aluno_id,
          aluno_nome: frequenciaAtual.matricula.estudante.nome,
          matricula: frequenciaAtual.matricula.estudante.matricula,
          status_anterior: frequenciaAtual.presente,
          status_novo: alteracao.presente,
          alteracao: `${statusAnterior} → ${statusNovo}`,
        });
      }
    }

    if (detalhesAlteracoes.length === 0) {
      throw new BadRequestException(
        'Nenhuma alteração foi necessária. Os status informados já são os atuais.',
      );
    }

    // Buscar frequências atualizadas para estatísticas finais
    const frequenciasAtualizadas = await this.prisma.frequencia.findMany({
      where: {
        matricula: {
          turma_id: turma.id,
        },
        data_aula: dataAula,
      },
      include: {
        matricula: {
          include: {
            estudante: true,
          },
        },
      },
    });

    const presentesFinal = frequenciasAtualizadas.filter(
      (f) => f.presente,
    ).length;
    const ausentesFinal = frequenciasAtualizadas.filter(
      (f) => !f.presente,
    ).length;

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
      data_alteracao: new Date(),
    };
  }

  // Método para desmatricular aluno individualmente
  async desmatricularAluno(
    desmatricularDto: DesmatricularAlunoDto,
    adminId: number,
  ) {
    await this.validateAdmin(adminId);

    const { matricula_aluno, codigo_turma } = desmatricularDto;

    // Buscar o aluno
    const aluno = await this.prisma.usuario.findUnique({
      where: { matricula: matricula_aluno },
    });

    if (!aluno || aluno.role !== 'aluno') {
      throw new NotFoundException('Aluno não encontrado');
    }

    // Buscar a turma
    const turma = await this.prisma.turma.findUnique({
      where: { codigo: codigo_turma },
      include: { disciplina: { select: { nome: true, codigo: true } } },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Buscar a matrícula
    const matricula = await this.prisma.matricula.findUnique({
      where: {
        estudante_id_turma_id: {
          estudante_id: aluno.id,
          turma_id: turma.id,
        },
      },
      include: {
        notas: true,
        frequencias: true,
      },
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    // Executar a desmatrícula (com cascata, notas e frequências serão removidas automaticamente)
    await this.prisma.matricula.delete({
      where: { id: matricula.id },
    });

    return {
      message: 'Aluno desmatriculado com sucesso',
      aluno: {
        nome: aluno.nome,
        matricula: aluno.matricula,
      },
      turma: {
        codigo: turma.codigo,
        disciplina: turma.disciplina.nome,
      },
      dados_removidos: {
        notas_removidas: matricula.notas.length,
        frequencias_removidas: matricula.frequencias.length,
      },
    };
  }

  // Métodos de deleção
  async deleteAluno(id: number, adminId: number) {
    await this.validateAdmin(adminId);

    const aluno = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        matriculas: {
          include: {
            turma: {
              include: {
                disciplina: { select: { nome: true } }
              }
            },
            notas: true,
            frequencias: true,
          }
        }
      },
    });

    if (!aluno || aluno.role !== 'aluno') {
      throw new NotFoundException('Aluno não encontrado');
    }

    // Com a nova configuração de cascata, as matrículas, notas e frequências serão removidas automaticamente
    const matriculasInfo = aluno.matriculas.map(m => ({
      turma: m.turma.codigo,
      disciplina: m.turma.disciplina.nome,
      notas: m.notas.length,
      frequencias: m.frequencias.length,
    }));

    await this.prisma.usuario.delete({
      where: { id },
    });

    return {
      message: 'Aluno excluído com sucesso',
      aluno_excluido: {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
      },
      dados_removidos: {
        matriculas_removidas: aluno.matriculas.length,
        detalhes_matriculas: matriculasInfo,
      },
    };
  }

  async deleteProfessor(id: number, adminId: number) {
    await this.validateAdmin(adminId);

    const professor = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        turmasMinistradas: {
          include: {
            disciplina: { select: { nome: true, codigo: true } },
            matriculas: true,
          }
        }
      },
    });

    if (!professor || professor.role !== 'professor') {
      throw new NotFoundException('Professor não encontrado');
    }

    // Verificar se o professor possui turmas ativas (isso ainda deve bloquear)
    if (professor.turmasMinistradas.length > 0) {
      const turmasInfo = professor.turmasMinistradas.map(t => ({
        codigo: t.codigo,
        disciplina: t.disciplina.nome,
        alunos_matriculados: t.matriculas.length,
      }));

      throw new BadRequestException({
        message: 'Não é possível excluir professor com turmas ativas. Reatribua as turmas primeiro.',
        turmas_ativas: turmasInfo,
      });
    }

    await this.prisma.usuario.delete({
      where: { id },
    });

    return {
      message: 'Professor excluído com sucesso',
      professor_excluido: {
        id: professor.id,
        nome: professor.nome,
        email: professor.email,
      },
    };
  }

  async deleteDisciplina(id: number, adminId: number) {
    await this.validateAdmin(adminId);

    const disciplina = await this.prisma.disciplina.findUnique({
      where: { id },
      include: {
        turmas: {
          include: {
            matriculas: {
              include: {
                notas: true,
                frequencias: true,
              }
            },
            professor: { select: { nome: true } },
          }
        },
        cursos: {
          include: {
            curso: { select: { nome: true, codigo: true } }
          }
        },
      },
    });

    if (!disciplina) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    // Com cascata configurada, turmas, matrículas, notas e frequências serão removidas automaticamente
    // Relacionamentos curso-disciplina também serão removidos automaticamente
    const turmasInfo = disciplina.turmas.map(t => ({
      codigo: t.codigo,
      professor: t.professor.nome,
      alunos_matriculados: t.matriculas.length,
      notas_total: t.matriculas.reduce((sum, m) => sum + m.notas.length, 0),
      frequencias_total: t.matriculas.reduce((sum, m) => sum + m.frequencias.length, 0),
    }));

    const cursosInfo = disciplina.cursos.map(cd => ({
      nome: cd.curso.nome,
      codigo: cd.curso.codigo,
    }));

    await this.prisma.disciplina.delete({
      where: { id },
    });

    return {
      message: 'Disciplina excluída com sucesso',
      disciplina_excluida: {
        id: disciplina.id,
        nome: disciplina.nome,
        codigo: disciplina.codigo,
      },
      dados_removidos: {
        turmas_removidas: disciplina.turmas.length,
        relacionamentos_curso_removidos: disciplina.cursos.length,
        detalhes_turmas: turmasInfo,
        cursos_afetados: cursosInfo,
      },
    };
  }

  async deleteTurma(id: number, adminId: number) {
    await this.validateAdmin(adminId);

    const turma = await this.prisma.turma.findUnique({
      where: { id },
      include: {
        matriculas: {
          include: {
            estudante: { select: { nome: true, matricula: true } },
            notas: true,
            frequencias: true,
          },
        },
        disciplina: { select: { nome: true, codigo: true } },
        professor: { select: { nome: true, email: true } },
        horarios: true,
      },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Com cascata configurada, matrículas, notas, frequências e horários serão removidos automaticamente
    const matriculasInfo = turma.matriculas.map(m => ({
      aluno_nome: m.estudante.nome,
      aluno_matricula: m.estudante.matricula,
      notas: m.notas.length,
      frequencias: m.frequencias.length,
    }));

    await this.prisma.turma.delete({
      where: { id },
    });

    return {
      message: 'Turma excluída com sucesso',
      turma_excluida: {
        id: turma.id,
        codigo: turma.codigo,
        disciplina: turma.disciplina.nome,
        professor: turma.professor.nome,
        ano: turma.ano,
        semestre: turma.semestre,
      },
      dados_removidos: {
        matriculas_removidas: turma.matriculas.length,
        horarios_removidos: turma.horarios.length,
        detalhes_alunos: matriculasInfo,
      },
    };
  }

  async deleteCurso(id: number, adminId: number) {
    await this.validateAdmin(adminId);

    const curso = await this.prisma.curso.findUnique({
      where: { id },
      include: {
        disciplinas: {
          include: {
            disciplina: {
              include: {
                turmas: {
                  include: {
                    matriculas: {
                      include: {
                        notas: true,
                        frequencias: true,
                      }
                    }
                  }
                },
              },
            },
          },
        },
      },
    });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado');
    }

    // Com cascata configurada, disciplinas, turmas, matrículas, notas e frequências 
    // dos relacionamentos curso-disciplina serão mantidas intactas
    // Apenas os relacionamentos curso-disciplina serão removidos automaticamente
    const disciplinasInfo = curso.disciplinas.map(cd => {
      const disciplina = cd.disciplina;
      const totalMatriculas = disciplina.turmas.reduce((sum, t) => sum + t.matriculas.length, 0);
      const totalNotas = disciplina.turmas.reduce((sum, t) =>
        sum + t.matriculas.reduce((sumNotas, m) => sumNotas + m.notas.length, 0), 0);
      const totalFrequencias = disciplina.turmas.reduce((sum, t) =>
        sum + t.matriculas.reduce((sumFreq, m) => sumFreq + m.frequencias.length, 0), 0);

      return {
        nome: disciplina.nome,
        codigo: disciplina.codigo,
        turmas: disciplina.turmas.length,
        alunos_matriculados: totalMatriculas,
        notas_existentes: totalNotas,
        frequencias_existentes: totalFrequencias,
      };
    });

    // Remover relacionamentos com disciplinas (será feito automaticamente pela cascata)
    // await this.prisma.cursoDisciplina.deleteMany({
    //   where: { curso_id: id },
    // });

    await this.prisma.curso.delete({
      where: { id },
    });

    return {
      message: 'Curso excluído com sucesso',
      curso_excluido: {
        id: curso.id,
        nome: curso.nome,
        codigo: curso.codigo,
        descricao: curso.descricao,
      },
      dados_preservados: {
        disciplinas_preservadas: curso.disciplinas.length,
        detalhes_disciplinas: disciplinasInfo,
        observacao: 'As disciplinas, turmas e dados acadêmicos foram preservados. Apenas a associação com o curso foi removida.',
      },
    };
  }

  // Métodos para gerenciamento de notas

  /**
   * Lança uma nota para um aluno
   */
  async lancarNota(lancarNotaDto: LancarNotaDto, professorId: number) {
    // Verificar se o professor existe
    await this.validateProfessor(professorId);

    // Buscar a matrícula com informações da turma e professor
    const matricula = await this.prisma.matricula.findUnique({
      where: { id: lancarNotaDto.matricula_id },
      include: {
        turma: {
          include: {
            professor: true,
            disciplina: true,
          },
        },
        estudante: true,
      },
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    // Verificar se o professor é responsável pela turma
    if (matricula.turma.professor_id !== professorId) {
      throw new UnauthorizedException(
        'Você só pode lançar notas para suas próprias turmas',
      );
    }

    // Verificar se já existe nota deste tipo para esta matrícula
    const notaExistente = await this.prisma.nota.findFirst({
      where: {
        matricula_id: lancarNotaDto.matricula_id,
        tipo: lancarNotaDto.tipo,
      },
    });

    if (notaExistente) {
      throw new ConflictException(
        `Já existe uma nota do tipo ${lancarNotaDto.tipo} para este aluno`,
      );
    }

    // Validar regras específicas para nota final
    if (lancarNotaDto.tipo === TipoNota.FINAL) {
      await this.validarLancamentoNotaFinal(lancarNotaDto.matricula_id);
    }

    // Criar a nota
    const nota = await this.prisma.nota.create({
      data: {
        matricula_id: lancarNotaDto.matricula_id,
        tipo: lancarNotaDto.tipo,
        valor: lancarNotaDto.valor,
        criado_por_id: professorId,
      },
      include: {
        criado_por: true,
        matricula: {
          include: {
            estudante: true,
            turma: {
              include: {
                disciplina: true,
              },
            },
          },
        },
      },
    });

    return {
      id: nota.id,
      valor: nota.valor,
      tipo: nota.tipo,
      criado_em: nota.criado_em,
      professor_nome: nota.criado_por.nome,
      aluno_nome: nota.matricula.estudante.nome,
      disciplina_nome: nota.matricula.turma.disciplina.nome,
    };
  }

  /**
   * Valida se é possível lançar nota final
   */
  private async validarLancamentoNotaFinal(matriculaId: number) {
    const notasUnidades = await this.prisma.nota.findMany({
      where: {
        matricula_id: matriculaId,
        tipo: {
          in: [TipoNota.UNIDADE_1, TipoNota.UNIDADE_2, TipoNota.UNIDADE_3],
        },
      },
    });

    if (notasUnidades.length < 3) {
      throw new BadRequestException(
        'Não é possível lançar nota final. O aluno deve ter notas nas 3 unidades primeiro',
      );
    }

    const mediaUnidades = notasUnidades.reduce((acc, nota) => acc + nota.valor, 0) / 3;

    if (mediaUnidades >= 7) {
      throw new BadRequestException(
        'Não é necessário lançar nota final. O aluno já foi aprovado com média das unidades igual ou superior a 7',
      );
    }
  }

  /**
   * Altera uma nota existente
   */
  async alterarNota(alterarNotaDto: AlterarNotaDto, professorId: number) {
    // Verificar se o professor existe
    await this.validateProfessor(professorId);

    // Buscar a nota com informações da matrícula e turma
    const nota = await this.prisma.nota.findUnique({
      where: { id: alterarNotaDto.nota_id },
      include: {
        matricula: {
          include: {
            turma: {
              include: {
                professor: true,
                disciplina: true,
              },
            },
            estudante: true,
          },
        },
        criado_por: true,
      },
    });

    if (!nota) {
      throw new NotFoundException('Nota não encontrada');
    }

    // Verificar se o professor é responsável pela turma
    if (nota.matricula.turma.professor_id !== professorId) {
      throw new UnauthorizedException(
        'Você só pode alterar notas de suas próprias turmas',
      );
    }

    // Atualizar a nota
    const notaAtualizada = await this.prisma.nota.update({
      where: { id: alterarNotaDto.nota_id },
      data: { valor: alterarNotaDto.valor },
      include: {
        criado_por: true,
        matricula: {
          include: {
            estudante: true,
            turma: {
              include: {
                disciplina: true,
              },
            },
          },
        },
      },
    });

    return {
      id: notaAtualizada.id,
      valor: notaAtualizada.valor,
      tipo: notaAtualizada.tipo,
      criado_em: notaAtualizada.criado_em,
      atualizado_em: notaAtualizada.atualizado_em,
      professor_nome: notaAtualizada.criado_por.nome,
      aluno_nome: notaAtualizada.matricula.estudante.nome,
      disciplina_nome: notaAtualizada.matricula.turma.disciplina.nome,
    };
  }

  /**
   * Lança múltiplas notas de uma vez
   */
  async lancarNotasLote(lancarNotasLoteDto: LancarNotasLoteDto, professorId: number): Promise<RespostaLoteNotas> {
    // Verificar se o professor existe
    await this.validateProfessor(professorId);

    const resultados: ResultadoOperacaoNota[] = [];
    let sucessos = 0;
    let erros = 0;

    for (const notaDto of lancarNotasLoteDto.notas) {
      try {
        const nota = await this.lancarNota(notaDto, professorId);
        resultados.push({
          sucesso: true,
          mensagem: 'Nota lançada com sucesso',
          nota,
        });
        sucessos++;
      } catch (error) {
        resultados.push({
          sucesso: false,
          mensagem: 'Erro ao lançar nota',
          erro: error.message,
        });
        erros++;
      }
    }

    return {
      total_processadas: lancarNotasLoteDto.notas.length,
      sucessos,
      erros,
      resultados,
    };
  }

  /**
   * Altera múltiplas notas de uma vez
   */
  async alterarNotasLote(alterarNotasLoteDto: AlterarNotasLoteDto, professorId: number): Promise<RespostaLoteNotas> {
    // Verificar se o professor existe
    await this.validateProfessor(professorId);

    const resultados: ResultadoOperacaoNota[] = [];
    let sucessos = 0;
    let erros = 0;

    for (const notaDto of alterarNotasLoteDto.notas) {
      try {
        const nota = await this.alterarNota(notaDto, professorId);
        resultados.push({
          sucesso: true,
          mensagem: 'Nota alterada com sucesso',
          nota,
        });
        sucessos++;
      } catch (error) {
        resultados.push({
          sucesso: false,
          mensagem: 'Erro ao alterar nota',
          erro: error.message,
        });
        erros++;
      }
    }

    return {
      total_processadas: alterarNotasLoteDto.notas.length,
      sucessos,
      erros,
      resultados,
    };
  }

  /**
   * Busca o boletim de um aluno em uma turma específica
   */
  async buscarBoletimAluno(matriculaId: number, professorId?: number) {
    const matricula = await this.prisma.matricula.findUnique({
      where: { id: matriculaId },
      include: {
        estudante: true,
        turma: {
          include: {
            disciplina: true,
            professor: true,
          },
        },
        notas: {
          include: {
            criado_por: true,
          },
          orderBy: {
            criado_em: 'asc',
          },
        },
      },
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    // Se for um professor, verificar se é responsável pela turma
    if (professorId) {
      await this.validateProfessor(professorId);
      if (matricula.turma.professor_id !== professorId) {
        throw new UnauthorizedException(
          'Você só pode visualizar boletins de suas próprias turmas',
        );
      }
    }

    const notas = matricula.notas.map(nota => ({
      id: nota.id,
      valor: nota.valor,
      tipo: nota.tipo,
      criado_em: nota.criado_em,
      professor_nome: nota.criado_por.nome,
    }));

    // Calcular média das unidades
    const notasUnidades = notas.filter(nota =>
      [TipoNota.UNIDADE_1, TipoNota.UNIDADE_2, TipoNota.UNIDADE_3].includes(nota.tipo as TipoNota)
    );

    let mediaUnidades: number | undefined;
    let notaFinal: number | undefined;
    let situacao = 'EM_ANDAMENTO';

    if (notasUnidades.length === 3) {
      mediaUnidades = notasUnidades.reduce((acc, nota) => acc + nota.valor, 0) / 3;

      if (mediaUnidades >= 7) {
        situacao = 'APROVADO';
      } else {
        const notaFinalObj = notas.find(nota => nota.tipo === TipoNota.FINAL);
        if (notaFinalObj) {
          notaFinal = notaFinalObj.valor;
          const mediaFinal = (mediaUnidades + notaFinal) / 2;
          situacao = mediaFinal >= 5 ? 'APROVADO' : 'REPROVADO';
        } else {
          situacao = 'AGUARDANDO_FINAL';
        }
      }
    }

    return {
      aluno_nome: matricula.estudante.nome,
      aluno_matricula: matricula.estudante.matricula,
      disciplina_nome: matricula.turma.disciplina.nome,
      professor_nome: matricula.turma.professor.nome,
      notas,
      media_unidades: mediaUnidades,
      nota_final: notaFinal,
      situacao,
    };
  }

  /**
   * Lista todas as notas de uma turma
   */
  async listarNotasTurma(turmaId: number, professorId: number) {
    // Verificar se o professor existe
    await this.validateProfessor(professorId);

    // Verificar se a turma existe e se o professor é responsável por ela
    const turma = await this.prisma.turma.findUnique({
      where: { id: turmaId },
      include: {
        disciplina: true,
        professor: true,
        matriculas: {
          include: {
            estudante: true,
            notas: {
              include: {
                criado_por: true,
              },
              orderBy: {
                criado_em: 'asc',
              },
            },
          },
        },
      },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (turma.professor_id !== professorId) {
      throw new UnauthorizedException(
        'Você só pode visualizar notas de suas próprias turmas',
      );
    }

    const boletins = turma.matriculas.map(matricula => {
      const notas = matricula.notas.map(nota => ({
        id: nota.id,
        valor: nota.valor,
        tipo: nota.tipo,
        criado_em: nota.criado_em,
        professor_nome: nota.criado_por.nome,
      }));

      // Calcular situação do aluno
      const notasUnidades = notas.filter(nota =>
        [TipoNota.UNIDADE_1, TipoNota.UNIDADE_2, TipoNota.UNIDADE_3].includes(nota.tipo as TipoNota)
      );

      let mediaUnidades: number | undefined;
      let notaFinal: number | undefined;
      let situacao = 'EM_ANDAMENTO';

      if (notasUnidades.length === 3) {
        mediaUnidades = notasUnidades.reduce((acc, nota) => acc + nota.valor, 0) / 3;

        if (mediaUnidades >= 7) {
          situacao = 'APROVADO';
        } else {
          const notaFinalObj = notas.find(nota => nota.tipo === TipoNota.FINAL);
          if (notaFinalObj) {
            notaFinal = notaFinalObj.valor;
            const mediaFinal = (mediaUnidades + notaFinal) / 2;
            situacao = mediaFinal >= 5 ? 'APROVADO' : 'REPROVADO';
          } else {
            situacao = 'AGUARDANDO_FINAL';
          }
        }
      }

      return {
        matricula_id: matricula.id,
        aluno_nome: matricula.estudante.nome,
        aluno_matricula: matricula.estudante.matricula,
        disciplina_nome: turma.disciplina.nome,
        professor_nome: turma.professor.nome,
        notas,
        media_unidades: mediaUnidades,
        nota_final: notaFinal,
        situacao,
      };
    });

    return {
      turma: {
        id: turma.id,
        codigo: turma.codigo,
        disciplina_nome: turma.disciplina.nome,
        professor_nome: turma.professor.nome,
        ano: turma.ano,
        semestre: turma.semestre,
      },
      boletins,
    };
  }
}
