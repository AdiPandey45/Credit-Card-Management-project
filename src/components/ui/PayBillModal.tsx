import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, BanknotesIcon, CreditCardIcon, BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePayments } from '../../hooks/usePayments';
import { useToast } from '../../hooks/useToast';
import clsx from 'clsx';

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  outstandingBalance: number;
  minimumDue: number;
  onPaymentSuccess: (newBalance: number) => void;
}

export default function PayBillModal({ 
  isOpen, 
  onClose, 
  outstandingBalance, 
  minimumDue,
  onPaymentSuccess 
}: PayBillModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; method?: string }>({});
  const { makePayment, isLoading, error, clearError } = usePayments();
  const { showToast } = useToast();

  const demoAccountId = '660e8400-e29b-41d4-a716-446655440000';

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Direct Debit',
      description: 'Direct debit from your bank account',
      icon: BanknotesIcon,
      processingTime: '1-2 business days'
    },
    {
      id: 'card',
      name: 'Debit Card',
      description: 'Pay using your debit card',
      icon: CreditCardIcon,
      processingTime: 'Instant'
    },
    {
      id: 'instant',
      name: 'Instant Payment',
      description: 'UPI/Net Banking instant transfer',
      icon: BoltIcon,
      processingTime: 'Instant'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setPaymentMethod('');
      setErrors({});
      clearError();
    }
  }, [isOpen, clearError]);

  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    if (!value || value.trim() === '') {
      return 'Please enter an amount';
    }
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid amount greater than 0';
    }
    if (numValue > outstandingBalance) {
      return `Amount cannot exceed outstanding balance of ₹${outstandingBalance.toLocaleString()}`;
    }
    return '';
  };

  const validateMethod = () => {
    if (!paymentMethod) {
      return 'Please select a payment method';
    }
    return '';
  };

  const handleAmountChange = (value: string) => {
    let sanitizedValue = value.replace(/[^0-9.]/g, '');
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    setAmount(sanitizedValue);
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const amountError = validateAmount(amount);
    const methodError = validateMethod();
    
    setErrors({
      amount: amountError,
      method: methodError
    });
    
    return !amountError && !methodError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const paymentAmount = parseFloat(amount);
      const result = await makePayment(demoAccountId, paymentAmount, paymentMethod);
      
      if (result) {
        showToast({
          type: 'success',
          title: 'Payment Successful',
          message: `₹${result.amount.toLocaleString()} paid successfully`,
          duration: 6000
        });
        
        onPaymentSuccess(result.newBalance || (outstandingBalance - paymentAmount));
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: errorMessage,
        duration: 8000
      });
    }
  };

  const getMethodDisplayName = (method: string) => {
    const methodObj = paymentMethods.find(m => m.id === method);
    return methodObj ? methodObj.name : method;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Pay Your Bill
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Outstanding Balance */}
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                    Outstanding Balance
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ₹{outstandingBalance.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Minimum Due: ₹{minimumDue.toLocaleString()}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Payment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                      className={clsx(
                        'w-full pl-8 pr-4 py-3 rounded border transition-colors',
                        'bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
                        'placeholder-slate-400 dark:placeholder-slate-500',
                        errors.amount
                          ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                          : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
                      )}
                    />
                  </div>
                  
                  {errors.amount && (
                    <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm">{errors.amount}</span>
                    </div>
                  )}
                  
                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(minimumDue)}
                      className="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      Min Due (₹{minimumDue.toLocaleString()})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(outstandingBalance)}
                      className="flex-1 px-3 py-2 text-sm bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                    >
                      Full Amount
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Payment Method
                  </label>
                  
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      
                      return (
                        <label
                          key={method.id}
                          className={clsx(
                            'flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                            isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/50'
                              : 'border-slate-300 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700'
                          )}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          
                          <div className={clsx(
                            'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
                            isSelected 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {method.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {method.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  
                  {errors.method && (
                    <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm">{errors.method}</span>
                    </div>
                  )}
                </div>

                {/* General Error */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !amount || !paymentMethod}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      amount ? `Pay ₹${parseFloat(amount || '0').toLocaleString()}` : 'Enter Amount'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}