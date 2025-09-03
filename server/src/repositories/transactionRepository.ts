import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export interface CreateTransactionData {
  cardId: number;
  userId: number;
  amount: number;
  merchant: string;
  category?: string;
  status?: string;
}

export interface TransactionFilters {
  userId: number;
  cardId?: number;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  status?: string;
}

export class TransactionRepository {
  async create(data: CreateTransactionData) {
    return prisma.transaction.create({
      data,
      select: {
        id: true,
        amount: true,
        merchant: true,
        date: true,
        status: true,
        card: {
          select: {
            id: true,
            number: true
          }
        }
      }
    });
  }

  async findById(id: number, userId: number) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        card: {
          select: {
            id: true,
            number: true
          }
        },
        disputes: true
      }
    });
  }

  async findByCardId(cardId: number, userId: number, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }) {
    return prisma.transaction.findMany({
      where: { cardId, userId },
      ...options,
      select: {
        id: true,
        amount: true,
        merchant: true,
        date: true,
        status: true,
        card: {
          select: {
            id: true,
            number: true
          }
        }
      }
    });
  }

  async findByFilters(filters: TransactionFilters, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }) {
    const where: Prisma.TransactionWhereInput = {
      userId: filters.userId,
      ...(filters.cardId && { cardId: filters.cardId }),
      ...(filters.category && { merchant: { contains: filters.category, mode: 'insensitive' } }),
      ...(filters.status && { status: filters.status }),
      ...(filters.startDate || filters.endDate) && {
        date: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lte: filters.endDate })
        }
      }
    };

    return prisma.transaction.findMany({
      where,
      ...options,
      select: {
        id: true,
        amount: true,
        merchant: true,
        date: true,
        status: true,
        card: {
          select: {
            id: true,
            number: true
          }
        }
      }
    });
  }

  async count(filters: TransactionFilters) {
    const where: Prisma.TransactionWhereInput = {
      userId: filters.userId,
      ...(filters.cardId && { cardId: filters.cardId }),
      ...(filters.category && { merchant: { contains: filters.category, mode: 'insensitive' } }),
      ...(filters.status && { status: filters.status }),
      ...(filters.startDate || filters.endDate) && {
        date: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lte: filters.endDate })
        }
      }
    };

    return prisma.transaction.count({ where });
  }
}

export const transactionRepository = new TransactionRepository();