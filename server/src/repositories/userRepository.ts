import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: 'USER' | 'ADMIN';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  passwordHash?: string;
  alertSettings?: any;
}

export class UserRepository {
  async create(data: CreateUserData) {
    return prisma.user.create({
      data: {
        ...data,
        role: data.role || 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        passwordHash: true,
        createdAt: true
      }
    });
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        alertSettings: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async update(id: number, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        alertSettings: true,
        updatedAt: true
      }
    });
  }

  async delete(id: number) {
    return prisma.user.delete({
      where: { id }
    });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    return prisma.user.findMany({
      ...options,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            cards: true,
            transactions: true
          }
        }
      }
    });
  }

  async count() {
    return prisma.user.count();
  }

  async updatePasswordHash(id: number, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: { id: true }
    });
  }
}

export const userRepository = new UserRepository();