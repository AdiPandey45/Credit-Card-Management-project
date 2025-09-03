import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export interface CreatePaymentData {
  cardId: number;
  userId: number;
  amount: number;
  method: string;
  status?: string;
}

export class PaymentRepository {
  async create(data: CreatePaymentData) {
    return prisma.payment.create({
      data,
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        date: true,
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
    return prisma.payment.findFirst({
      where: { id, userId },
      include: {
        card: {
          select: {
            id: true,
            number: true
          }
        }
      }
    });
  }

  async findByCardId(cardId: number, userId: number, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }) {
    return prisma.payment.findMany({
      where: { cardId, userId },
      ...options,
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        date: true,
        card: {
          select: {
            id: true,
            number: true
          }
        }
      }
    });
  }

  async updateStatus(id: number, status: string) {
    return prisma.payment.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        date: true
      }
    });
  }
}

export const paymentRepository = new PaymentRepository();