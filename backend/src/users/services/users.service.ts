import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../repositories/users.repository.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  // Cadastrar usuário
  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.usersRepository.create({
      name,
      email,
      passwordHash,
    });

    const { passwordHash: _, ...result } = user;

    return result;
  }

  // Listar usuários
  async findAll() {
    return this.usersRepository.findAll();
  }

  // Buscar usuário por ID
  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const { passwordHash: _, ...result } = user;

    return result;
  }

  // Atualizar usuário
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const { name, email, password } = updateUserDto;

    if (email && email !== user.email) {
      const existingUser = await this.usersRepository.findByEmail(email);

      if (existingUser) {
        throw new ConflictException('Este e-mail já está cadastrado.');
      }
    }

    const data: {
      name?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (name !== undefined) {
      data.name = name;
    }

    if (email !== undefined) {
      data.email = email;
    }

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.usersRepository.update(id, data);

    const { passwordHash: _, ...result } = updatedUser;

    return result;
  }

  // Excluir usuário
  async remove(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.usersRepository.delete(id);

    return {
      message: 'Usuário excluído com sucesso.',
    };
  }
}
