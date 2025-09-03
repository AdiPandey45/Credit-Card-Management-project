import prisma from '../prisma';

export interface CreateRewardData {
  cardId: number;
  userId: number;
  points: number;
}

export interface UpdateRewardData {
  points: number;
}

export class RewardRepository {
  async create(data: CreateRewardData) {
    return prisma.reward.create({
      data,
      select: {
        id: true,
        points: true,
        updatedAt: true,
        card: {
          select: {
            id: true,
            number: true
          }
        }
      }
    });
  }

  async findByCardId(cardId: number, userId: number) {
    return prisma.reward.findFirst({
      where: { cardId, userId },
      select: {
        id: true,
        points: true,
        updatedAt: true,
        card: {
          select: {
            id: true,
            number: true
          }
        }
      }
    });
  }

  async updatePoints(cardId: number, userId: number, points: number) {
    return prisma.reward.upsert({
      where: { 
        cardId_userId: {
          cardId,
          userId
        }
      },
      update: { points },
      create: { cardId, userId, points },
      select: {
        id: true,
        points: true,
        updatedAt: true
      }
    });
  }

  async findOffers(userId?: number) {
    return prisma.offer.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true
      }
    });
  }
}

export const rewardRepository = new RewardRepository();