import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TransactionsTable from '../components/tables/TransactionsTable';
import { MagnifyingGlassIcon, FunnelIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const mockTransactions = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Swiggy - Food Delivery',
    category: 'Food & Dining',
    amount: -480,
    status: 'completed' as const,
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Amazon - Online Shopping',
    category: 'Shopping',
    amount: -2340,
    status: 'completed' as const,
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Uber - Ride',
    category: 'Transport',
    amount: -280,
    status: 'pending' as const,
  },
  {
    id: '4',
    date: '2024-01-12',
    description: 'Salary Credit',
    category: 'Others',
    amount: 75000,
    status: 'completed' as const,
  },
  {
    id: '5',
    date: '2024-01-11',
    description: 'Netflix - Subscription',
    category: 'Entertainment',
    amount: -799,
    status: 'failed' as const,
  },
];

export default function Transactions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your transaction history
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <CalendarDaysIcon className="w-4 h-4" />
          <span>Export CSV</span>
        </motion.button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white appearance-none min-w-[180px]"
            >
              <option value="all">All Categories</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Shopping">Shopping</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills">Bills</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white appearance-none min-w-[150px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TransactionsTable
          transactions={mockTransactions}
          onPageChange={handlePageChange}
          totalPages={5}
          currentPage={currentPage}
        />
      </motion.div>
    </div>
  );
}