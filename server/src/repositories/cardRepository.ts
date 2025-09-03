import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export interface CreateCardApplicationData {
  userId: number;
  fullName: string;
  email: string;
  pan: string;
  income: number;
  product: string;
  document?: string;
}

export interface CreateCardData {
  userId: number;
  number: string;
  type: string;
  creditLimit: number;
  status?: 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
}

export class CardRepository {
  async createApplication(data: CreateCardApplicationData) {
    return prisma.cardApplication.create({
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        product: true,
        status: true,
        createdAt: true
      }
    });
  }

  async findApplicationById(id: number, userId: number) {
    return prisma.cardApplication.findFirst({
      where: { id, userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        pan: true,
        income: true,
        product: true,
        status: true,
        createdAt: true
      }
    });
  }

  async findApplicationsByUser(userId: number) {
    return prisma.cardApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        product: true,
        status: true,
        createdAt: true
      }
    });
  }

  async updateApplicationStatus(id: number, status: string) {
    return prisma.cardApplication.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        updatedAt: true
      }
    });
  }

  async createCard(data: CreateCardData) {
    return prisma.card.create({
      data,
      select: {
        id: true,
        number: true,
        status: true,
        createdAt: true
      }
    });
  }

  async findCardById(id: number, userId: number) {
    return prisma.card.findFirst({
      where: { id, userId },
      select: {
        id: true,
        number: true,
        status: true,
        autopayEnabled: true,
        createdAt: true
      }
    });
  }

  async findCardsByUser(userId: number) {
    return prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        number: true,
        status: true,
        autopayEnabled: true,
        createdAt: true
      }
    });
  }

  async updateCardStatus(id: number, status: string) {
    return prisma.card.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        updatedAt: true
      }
    });
  }

  async updateAutopay(id: number, enabled: boolean) {
    return prisma.card.update({
      where: { id },
      data: { autopayEnabled: enabled },
      select: {
        id: true,
        autopayEnabled: true,
        updatedAt: true
      }
    });
  }
}

export const cardRepository = new CardRepository();