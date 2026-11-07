import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Buscar usuário pelo e-mail
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Buscar usuário pelo ID
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Listar todos os usuários
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Cadastrar usuário
  async create(data: { name: string; email: string; passwordHash: string }) {
    return this.prisma.user.create({ data }).catch((error) => {
      if (error.code === 'P2002')
        throw new ConflictException('Este e-mail já está cadastrado.');
      throw error;
    });
  }

  // Atualizar usuário
  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string;
    },
  ) {
    return this.prisma.user.update({ where: { id }, data }).catch((error) => {
      if (error.code === 'P2002')
        throw new ConflictException('Este e-mail já está cadastrado.');
      throw error;
    });
  }

  // Excluir usuário
  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
