import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function Payments() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Make a Payment
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pay your credit card bill quickly and securely
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Outstanding Balance
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
            ₹45,320
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Due on January 25, 2024
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white text-base sm:text-lg"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmount('45320')}
                className="px-3 py-1 text-xs sm:text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
              >
                Full Amount
              </button>
              <button
                type="button"
                onClick={() => setAmount('2266')}
                className="px-3 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Minimum (₹2,266)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  <BanknotesIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Bank Account</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Direct debit</p>
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
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  <CreditCardIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Debit Card</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Instant payment</p>
                </div>
              </label>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 text-base sm:text-lg"
          >
            Make Payment
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}