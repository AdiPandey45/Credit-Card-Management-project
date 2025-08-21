import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  BoltIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { usePayments } from '../hooks/usePayments';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

export default function Payments() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; method?: string }>({});
  const { makePayment, isLoading, error, clearError } = usePayments();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Demo account data
  const outstandingBalance = 45320;
  const minimumDue = 2266;
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
    // Allow only numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(sanitizedValue);
    
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const handleMethodChange = (method: string) => {
    setPaymentMethod(method);
    
    // Clear method error when user selects
    if (errors.method) {
      setErrors(prev => ({ ...prev, method: '' }));
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    
    // Clear amount error
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
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

  const isFormValid = () => {
    const amountError = validateAmount(amount);
    const methodError = validateMethod();
    return !amountError && !methodError;
  };

  const getMethodDisplayName = (method: string) => {
    const methodObj = paymentMethods.find(m => m.id === method);
    return methodObj ? methodObj.name : method;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors and try again'
      });
      return;
    }

    if (!user) {
      showToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to make a payment'
      });
      return;
    }

    clearError();
    
    try {
      const paymentAmount = parseFloat(amount);
      const result = await makePayment(demoAccountId, paymentAmount, paymentMethod);
      
      if (result) {
        showToast({
          type: 'success',
          title: 'Payment Successful',
          message: `₹${result.amount.toLocaleString()} paid successfully via ${getMethodDisplayName(paymentMethod)}`
        });
        
        // Reset form only after success
        setAmount('');
        setPaymentMethod('');
        setErrors({});
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: error || 'Please try again later'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Make a Payment
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Pay your credit card bill quickly and securely
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto"
      >
        {/* Outstanding Balance */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
            Outstanding Balance
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400">
            ₹{outstandingBalance.toLocaleString()}
          </p>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
            Due on January 25, 2024
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Payment Amount */}
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-3">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-lg">
                ₹
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={clsx(
                  'w-full pl-10 pr-4 py-4 rounded border transition-all duration-200',
                  'bg-white dark:bg-slate-900',
                  'placeholder-slate-400 dark:placeholder-slate-500',
                  'text-slate-900 dark:text-white text-lg',
                  errors.amount
                    ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
                )}
              />
            </div>
            
            {/* Amount Error */}
            {errors.amount && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{errors.amount}</span>
              </div>
            )}
            
            {/* Quick Amount Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <button
                type="button"
                onClick={() => handleQuickAmount(outstandingBalance)}
                className="px-4 py-2 text-sm bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              >
                Full Amount (₹{outstandingBalance.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(minimumDue)}
                className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Minimum Due (₹{minimumDue.toLocaleString()})
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-4">
              Payment Method
            </label>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                
                return (
                  <motion.label
                    key={method.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={clsx(
                      'flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
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
                      onChange={(e) => handleMethodChange(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-center flex-1">
                      <div className={clsx(
                        'w-12 h-12 rounded-lg flex items-center justify-center mr-4',
                        isSelected 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {method.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {method.description}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Processing: {method.processingTime}
                        </p>
                      </div>
                      
                      <div className={clsx(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-slate-300 dark:border-slate-600'
                      )}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </motion.label>
                );
              })}
            </div>
            
            {/* Method Error */}
            {errors.method && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{errors.method}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={isFormValid() && !isLoading ? { scale: 1.02 } : {}}
            whileTap={isFormValid() && !isLoading ? { scale: 0.98 } : {}}
            type="submit"
            disabled={!isFormValid() || isLoading}
            className={clsx(
              'w-full px-6 py-4 sm:py-5 font-semibold rounded shadow-sm transition-all duration-200 text-lg',
              isFormValid() && !isLoading
                ? 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              `Pay ${amount ? `₹${parseFloat(amount || '0').toLocaleString()}` : 'Amount'}`
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}