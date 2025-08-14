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
  'Food & Dining': 'bg-orange-500 text-white',
  'Shopping': 'bg-purple-500 text-white',
  'Transport': 'bg-blue-500 text-white',
  'Entertainment': 'bg-pink-500 text-white',
  'Bills': 'bg-red-500 text-white',
  'Healthcare': 'bg-green-500 text-white',
  'Others': 'bg-slate-500 text-white',
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
    <tr className="animate-pulse border-b border-slate-200 dark:border-slate-700 h-16">
      <td className="px-6 py-4 w-24">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 min-w-0 flex-1">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
      </td>
      <td className="px-6 py-4 w-32 hidden lg:table-cell">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24 mx-auto"></div>
      </td>
      <td className="px-6 py-4 w-28">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div>
      </td>
      <td className="px-6 py-4 w-20 hidden sm:table-cell">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4 mx-auto"></div>
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

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <div className="text-sm text-slate-700 dark:text-slate-300">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="p-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </motion.button>
        
        {getVisiblePages().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`dots-${index}`} className="px-3 py-2 text-slate-500">
              ...
            </span>
          ) : (
            <motion.button
              key={pageNum}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pageNum as number)}
              disabled={loading}
              className={clsx(
                'px-3 py-2 rounded text-sm font-medium transition-colors min-w-[40px]',
                pageNum === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              {pageNum}
            </motion.button>
          )
        ))}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="p-2 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </motion.button>
      </div>
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
      <AnimatePresence mode="wait">
        {loading ? (
          <>
            {Array.from({ length: 5 }, (_, i) => <SkeletonRow key={`skeleton-${i}`} />)}
          </>
        ) : (
          <>
            {transactions.map((transaction, index) => {
              const StatusIcon = statusIcons[transaction.status];
              return (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="h-16 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700"
                >
                  <td className="px-6 py-4 w-24 text-left align-middle">
                    <div className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 min-w-0 flex-1 align-middle">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate" title={transaction.description}>
                      {transaction.description}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 lg:hidden mt-1">
                      {transaction.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 w-32 hidden lg:table-cell align-middle">
                    <div className="flex justify-center">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded h-6',
                        categoryColors[transaction.category] || categoryColors['Others']
                      )}>
                        {transaction.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-28 text-right align-middle">
                    <div className={clsx(
                      'text-sm font-semibold tabular-nums',
                      transaction.amount < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    )}>
                      {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString()}
                    </div>
                    <div className="flex items-center justify-end mt-1 sm:hidden">
                      <StatusIcon 
                        className={clsx('w-4 h-4', statusColors[transaction.status])} 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 w-20 hidden sm:table-cell align-middle">
                    <div className="flex items-center justify-center">
                      <StatusIcon 
                        className={clsx('w-5 h-5', statusColors[transaction.status])} 
                      />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </>
        )}
      </AnimatePresence>
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
        <table className="w-full table-fixed">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 w-24 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 min-w-0 flex-1 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 w-32 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                Category
              </th>
              <th className="px-6 py-3 w-28 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 w-20 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.tbody
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="divide-y divide-slate-200 dark:divide-slate-700"
              >
                {Array.from({ length: 5 }, (_, i) => <SkeletonRow key={`skeleton-${i}`} />)}
              </motion.tbody>
            ) : (
              <motion.tbody
                key={`page-${currentPage}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="divide-y divide-slate-200 dark:divide-slate-700"
              >
                {transactions.map((transaction, index) => {
                  const StatusIcon = statusIcons[transaction.status];
                  return (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="h-16 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-6 py-4 w-24 text-left align-middle">
                        <div className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {new Date(transaction.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-0 flex-1 align-middle">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 lg:hidden mt-1">
                          {transaction.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-32 hidden lg:table-cell align-middle">
                        <div className="flex justify-center">
                          <span className={clsx(
                            'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded h-6',
                            categoryColors[transaction.category] || categoryColors['Others']
                          )}>
                            {transaction.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-28 text-right align-middle">
                        <div className={clsx(
                          'text-sm font-semibold tabular-nums',
                          transaction.amount < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        )}>
                          {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end mt-1 sm:hidden">
                          <StatusIcon 
                            className={clsx('w-4 h-4', statusColors[transaction.status])} 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 w-20 hidden sm:table-cell align-middle">
                        <div className="flex items-center justify-center">
                          <StatusIcon 
                            className={clsx('w-5 h-5', statusColors[transaction.status])} 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </motion.tbody>
            )}
          </AnimatePresence>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={loading}
      />
    </div>
  );
}