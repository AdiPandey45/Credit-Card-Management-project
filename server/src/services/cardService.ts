import { cardRepository } from '../repositories/cardRepository';
import { createError } from '../middleware/errorHandler';

export interface CardApplicationData {
  fullName: string;
  email: string;
  pan: string;
  income: number;
  product: string;
  document?: string;
}

export class CardService {
  async createApplication(userId: number, data: CardApplicationData) {
    return cardRepository.createApplication({
      userId,
      ...data
    });
  }

  async getApplication(id: number, userId: number) {
    const application = await cardRepository.findApplicationById(id, userId);
    if (!application) {
      throw createError('Application not found', 404, 'APPLICATION_NOT_FOUND');
    }
    return application;
  }

  async getUserApplications(userId: number) {
    return cardRepository.findApplicationsByUser(userId);
  }

  async updateApplicationStatus(id: number, status: string) {
    return cardRepository.updateApplicationStatus(id, status);
  }

  async getCard(id: number, userId: number) {
    const card = await cardRepository.findCardById(id, userId);
    if (!card) {
      throw createError('Card not found', 404, 'CARD_NOT_FOUND');
    }
    return card;
  }

  async getUserCards(userId: number) {
    return cardRepository.findCardsByUser(userId);
  }

  async activateCard(id: number, userId: number) {
    // Verify card belongs to user
    await this.getCard(id, userId);
    return cardRepository.updateCardStatus(id, 'ACTIVE');
  }

  async blockCard(id: number, userId: number) {
    // Verify card belongs to user
    await this.getCard(id, userId);
    return cardRepository.updateCardStatus(id, 'BLOCKED');
  }

  async unblockCard(id: number, userId: number) {
    // Verify card belongs to user
    await this.getCard(id, userId);
    return cardRepository.updateCardStatus(id, 'ACTIVE');
  }

  async updateAutopay(id: number, userId: number, enabled: boolean) {
    // Verify card belongs to user
    await this.getCard(id, userId);
    return cardRepository.updateAutopay(id, enabled);
  }
}

export const cardService = new CardService();