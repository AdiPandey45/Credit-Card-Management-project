import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function Payments() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');

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
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
            Outstanding Balance
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400">
            ₹45,320
          </p>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
            Due on January 25, 2024
          </p>
        </div>

        <form className="space-y-8">
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-3">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-lg">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white text-lg"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <button
                type="button"
                onClick={() => setAmount('45320')}
                className="px-4 py-2 text-sm bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              >
                Full Amount
              </button>
              <button
                type="button"
                onClick={() => setAmount('2266')}
                className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Minimum (₹2,266)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-4">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  <BanknotesIcon className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-3" />
                  <p className="font-semibold text-slate-900 dark:text-white text-lg">Bank Account</p>
                  <p className="text-slate-500 dark:text-slate-400">Direct debit</p>
                </div>
              </label>
              
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  <CreditCardIcon className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-3" />
                  <p className="font-semibold text-slate-900 dark:text-white text-lg">Debit Card</p>
                  <p className="text-slate-500 dark:text-slate-400">Instant payment</p>
                </div>
              </label>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full px-6 py-4 sm:py-5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded shadow-sm hover:shadow transition-all duration-200 text-lg"
          >
            Make Payment
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}