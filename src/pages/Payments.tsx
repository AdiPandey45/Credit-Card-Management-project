import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { usePayments } from '../hooks/usePayments';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

export default function Payments() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; method?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
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
    let sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitizedValue.split('.');
    // Allow only numbers, decimal point, and handle edge cases
    if (parts.length > 2) {
      sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Check for non-numeric characters (except decimal point)
    if (!/^\d*\.?\d*$/.test(sanitizedValue)) {
      return;
    }
    
    // Prevent leading zeros (except for decimal numbers like 0.5)
    if (sanitizedValue.length > 1 && sanitizedValue[0] === '0' && sanitizedValue[1] !== '.') {
      sanitizedValue = sanitizedValue.substring(1);
    }
    
    setAmount(sanitizedValue);
    
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
    
    // Clear general error when user makes changes
    if (error) {
      clearError();
    }
  };

  const handleMethodChange = (method: string) => {
    setPaymentMethod(method);
    
    // Clear method error when user selects
    if (errors.method) {
      setErrors(prev => ({ ...prev, method: '' }));
    }
    
    // Clear general error when user makes changes
    if (error) {
      clearError();
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    
    // Clear amount error
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
    
    // Clear general error
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

  const isFormValid = () => {
    const amountError = validateAmount(amount);
    const methodError = validateMethod();
    return !amountError && !methodError;
  };

  const getMethodDisplayName = (method: string) => {
    const methodObj = paymentMethods.find(m => m.id === method);
    return methodObj ? methodObj.name : method;
  };

  // Prevent duplicate submissions
  const canSubmit = () => {
    const now = Date.now();
    return !isSubmitting && !isLoading && (now - lastSubmissionTime > 2000);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (!canSubmit()) {
      return;
    }
    
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

    setIsSubmitting(true);
    setLastSubmissionTime(Date.now());
    clearError();
    
    try {
      const paymentAmount = parseFloat(amount);
      
      // Validate amount one more time before submission
      if (paymentAmount > outstandingBalance) {
        throw new Error(`Amount ₹${paymentAmount.toLocaleString()} exceeds outstanding balance of ₹${outstandingBalance.toLocaleString()}`);
      }
      
      const result = await makePayment(demoAccountId, paymentAmount, paymentMethod);
      
      if (result) {
        showToast({
          type: 'success',
          title: 'Payment Successful',
          message: `₹${result.amount.toLocaleString()} paid successfully via ${getMethodDisplayName(paymentMethod)}`,
          duration: 6000
        });
        
        // Reset form only after success
        setAmount('');
        setPaymentMethod('');
        setErrors({});
        
        // Optional: Refresh account data or update balance in real-time
        // This would typically trigger a refetch of account data
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (error || 'Payment processing failed. Please try again.');
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: errorMessage,
        duration: 8000
      });
      
      // Don't reset form on error - let user retry
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time validation feedback
  const getAmountInputClass = () => {
    const baseClass = 'w-full pl-10 pr-4 py-4 rounded border transition-all duration-200 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white text-lg';
    
    if (errors.amount) {
      return `${baseClass} border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500`;
    }
    
    if (amount && !validateAmount(amount)) {
      return `${baseClass} border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-2 focus:ring-green-500`;
    }
    
    return `${baseClass} border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500`;
  };

  // Get button state and styling
  const getButtonState = () => {
    const isValid = isFormValid();
    const canSubmitNow = canSubmit();
    const isProcessing = isSubmitting || isLoading;
    
    return {
      disabled: !isValid || !canSubmitNow || isProcessing,
      className: clsx(
        'w-full px-6 py-4 sm:py-5 font-semibold rounded shadow-sm transition-all duration-200 text-lg',
        isValid && canSubmitNow && !isProcessing
          ? 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg cursor-pointer'
          : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
      ),
      text: isProcessing 
        ? 'Processing Payment...' 
        : amount 
          ? `Pay ₹${parseFloat(amount || '0').toLocaleString()}` 
          : 'Enter Amount to Pay'
    };
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
                className={getAmountInputClass()}
                disabled={isSubmitting || isLoading}
              />
              {amount && !errors.amount && validateAmount(amount) === '' && (
                <CheckCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
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
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 text-sm bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              >
                Full Amount (₹{outstandingBalance.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(minimumDue)}
                disabled={isSubmitting || isLoading}
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
                      (isSubmitting || isLoading) && 'opacity-50 cursor-not-allowed',
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
                      disabled={isSubmitting || isLoading}
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

          {/* General Error Display */}
          {error && !errors.amount && !errors.method && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
          {/* Submit Button */}
          {(() => {
            const buttonState = getButtonState();
            return (
          <motion.button
                whileHover={!buttonState.disabled ? { scale: 1.02 } : {}}
                whileTap={!buttonState.disabled ? { scale: 0.98 } : {}}
            type="submit"
                disabled={buttonState.disabled}
                className={buttonState.className}
          >
                {(isSubmitting || isLoading) ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {buttonState.text}
              </div>
            ) : (
                  buttonState.text
            )}
          </motion.button>
            );
          })()}
        </form>
      </motion.div>
    </div>
  );
}