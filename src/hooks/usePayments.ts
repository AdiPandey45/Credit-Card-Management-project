import { useState, useCallback } from 'react';
import { paymentsAPI } from '../services/api';

interface PaymentData {
  paymentId: string;
  amount: number;
  method: string;
  status: 'pending' | 'success' | 'failed';
  newBalance?: number;
  timestamp: string;
}

interface UsePaymentsReturn {
  isLoading: boolean;
  error: string | null;
  makePayment: (accountId: string, amount: number, method: string) => Promise<PaymentData | null>;
  getPaymentHistory: (userId: string) => Promise<any[]>;
  getReceipt: (paymentId: string) => Promise<any>;
  clearError: () => void;
}

export function usePayments(): UsePaymentsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const makePayment = useCallback(async (
    accountId: string, 
    amount: number, 
    method: string
  ): Promise<PaymentData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Additional client-side validation
      if (!accountId || !amount || !method) {
        throw new Error('Missing required payment information');
      }
      
      if (amount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }
      
      if (!['bank', 'card', 'instant'].includes(method)) {
        throw new Error('Invalid payment method selected');
      }
      
      const response = await paymentsAPI.createPayment(accountId, amount, method);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Payment failed');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      console.error('Payment error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentHistory = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentsAPI.getUserPayments(userId);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch payment history');
        return [];
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment history';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReceipt = useCallback(async (paymentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentsAPI.getReceipt(paymentId);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch receipt');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch receipt';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    makePayment,
    getPaymentHistory,
    getReceipt,
    clearError,
  };
}