import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

// comment: O código abaixo define os serviços de usuários da aplicação. Aqui que realmente ocorrem as requisições e consultas ao banco de dados. O DTO deve ser importado para validar os dados de entrada.
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  create(createUserDto: CreateUserDto) {
    return this.prisma.usuario.create({ data: createUserDto });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.usuario.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
