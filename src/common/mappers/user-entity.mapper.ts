import { UserEntity } from '../../users/entities/user.entity';

/**
 * Helper para criar UserEntity de forma consistente
 * Padroniza a criação da entidade em todos os controllers
 */
export class UserEntityMapper {
  static toEntity(user: any): UserEntity {
    return new UserEntity({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      matricula: user.matricula || null,
      criado_em: user.criado_em,
      atualizado_em: user.atualizado_em,
      senha: '', // Campo excluído pela anotação @Exclude
    });
  }

  static toEntities(users: any[]): UserEntity[] {
    return users.map((user) => this.toEntity(user));
  }
}
