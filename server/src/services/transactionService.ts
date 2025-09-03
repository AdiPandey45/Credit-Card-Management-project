import { transactionRepository, TransactionFilters } from '../repositories/transactionRepository';
import { cardRepository } from '../repositories/cardRepository';
import { createError } from '../middleware/errorHandler';

export class TransactionService {
  async getTransactionsByCard(cardId: number, userId: number, page: number = 1, limit: number = 20) {
    // Verify card belongs to user
    const card = await cardRepository.findCardById(cardId, userId);
    if (!card) {
      throw createError('Card not found', 404, 'CARD_NOT_FOUND');
    }

    const skip = (page - 1) * limit;
    const transactions = await transactionRepository.findByCardId(cardId, userId, {
      skip,
      take: limit,
      orderBy: { date: 'desc' }
    });

    return transactions;
  }

  async getTransaction(id: number, userId: number) {
    const transaction = await transactionRepository.findById(id, userId);
    if (!transaction) {
      throw createError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }
    return transaction;
  }

  async getTransactionsByFilters(filters: TransactionFilters, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      transactionRepository.findByFilters(filters, {
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      }),
      transactionRepository.count(filters)
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const transactionService = new TransactionService();