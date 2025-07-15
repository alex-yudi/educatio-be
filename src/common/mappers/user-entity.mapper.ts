import { UserEntity } from '../../users/entities/user.entity';

/**
 * Helper para criar UserEntity de forma consistente
 * Padroniza a criação da entidade em todos os controllers
 */
export class UserEntityMapper {
  static toEntity(user: any): UserEntity {
    return new UserEntity({
      id: user.id,
      name: user.nome,
      nome: user.nome,
      email: user.email,
      password: '',
      role: user.role,
      registrationNumber: user.matricula || null,
      matricula: user.matricula || null,
      createdAt: user.criado_em,
      criado_em: user.criado_em,
      updatedAt: user.atualizado_em,
      atualizado_em: user.atualizado_em,
    });
  }

  static toEntities(users: any[]): UserEntity[] {
    return users.map(user => this.toEntity(user));
  }
}
