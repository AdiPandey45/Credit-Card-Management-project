import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onPageChange: (page: number) => void;
  totalPages: number;
  currentPage?: number;
  loading?: boolean;
  hideHeader?: boolean;
}

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  'Shopping': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  'Transport': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  'Bills': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  'Healthcare': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'Others': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const statusIcons = {
  completed: CheckCircleIcon,
  pending: ClockIcon,
  failed: XCircleIcon,
};

const statusColors = {
  completed: 'text-green-600 dark:text-green-400',
  pending: 'text-yellow-600 dark:text-yellow-400',
  failed: 'text-red-600 dark:text-red-400',
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-3 sm:px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
      </td>
      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
      </td>
      <td className="px-3 sm:px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
      </td>
      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 text-slate-400 dark:text-slate-600 mb-4">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        No transactions yet
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Your transaction history will appear here once you start using your card.
      </p>
      <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
        Make your first transaction
      </button>
    </div>
  );
}

export default function TransactionsTable({ 
  transactions, 
  onPageChange, 
  totalPages, 
  currentPage = 1,
  loading = false,
  hideHeader = false
}: TransactionsTableProps) {
  if (!loading && transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
        <EmptyState />
      </div>
    );
  }

  // If hideHeader is true, render only the table content without wrapper
  if (hideHeader) {
    return (
      <>
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 5 }, (_, i) => <SkeletonRow key={`skeleton-${i}`} />)
          ) : (
            transactions.map((transaction, index) => {
              const StatusIcon = statusIcons[transaction.status];
              return (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                  className="transition-colors duration-200 hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                    {new Date(transaction.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                      {transaction.category}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                    <span className={clsx(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      categoryColors[transaction.category] || categoryColors['Others']
                    )}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-right">
                    <span className={clsx(
                      'text-sm font-medium',
                      transaction.amount < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    )}>
                      {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString()}
                    </span>
                    <div className="flex items-center justify-end mt-1 sm:hidden">
                      <StatusIcon 
                        className={clsx('w-4 h-4', statusColors[transaction.status])} 
                      />
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center">
                      <StatusIcon 
                        className={clsx('w-5 h-5', statusColors[transaction.status])} 
                      />
                    </div>
                  </td>
                </motion.tr>
              );
            })
          )}
        </AnimatePresence>
        
        {/* Pagination for embedded table */}
        {totalPages > 1 && (
          <tr>
            <td colSpan={5} className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    className="p-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </motion.button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onPageChange(pageNum)}
                      disabled={loading}
                      className={clsx(
                        'px-3 py-2 rounded text-sm font-medium transition-colors',
                        pageNum === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {pageNum}
                    </motion.button>
                  ))}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    className="p-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {!hideHeader && (
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] sm:min-w-[600px]">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Category
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 5 }, (_, i) => <SkeletonRow key={`skeleton-${i}`} />)
              ) : (
                transactions.map((transaction, index) => {
                  const StatusIcon = statusIcons[transaction.status];
                  return (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                      className="transition-colors duration-200 hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {new Date(transaction.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                          {transaction.category}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                        <span className={clsx(
                          'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                          categoryColors[transaction.category] || categoryColors['Others']
                        )}>
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-right">
                        <span className={clsx(
                          'text-sm font-medium',
                          transaction.amount < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        )}>
                          {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString()}
                        </span>
                        <div className="flex items-center justify-end mt-1 sm:hidden">
                          <StatusIcon 
                            className={clsx('w-4 h-4', statusColors[transaction.status])} 
                          />
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center">
                          <StatusIcon 
                            className={clsx('w-5 h-5', statusColors[transaction.status])} 
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="p-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="p-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}