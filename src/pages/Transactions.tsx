import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionsTable from '../components/tables/TransactionsTable';
import { MagnifyingGlassIcon, FunnelIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

// Extended mock data for better pagination demonstration
const allMockTransactions = [
  // Page 1
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
  // Page 2
  {
    id: '6',
    date: '2024-01-10',
    description: 'Flipkart - Electronics',
    category: 'Shopping',
    amount: -15600,
    status: 'completed' as const,
  },
  {
    id: '7',
    date: '2024-01-09',
    description: 'Zomato - Food Order',
    category: 'Food & Dining',
    amount: -850,
    status: 'completed' as const,
  },
  {
    id: '8',
    date: '2024-01-08',
    description: 'Petrol Pump',
    category: 'Transport',
    amount: -3200,
    status: 'completed' as const,
  },
  {
    id: '9',
    date: '2024-01-07',
    description: 'Movie Tickets',
    category: 'Entertainment',
    amount: -600,
    status: 'completed' as const,
  },
  {
    id: '10',
    date: '2024-01-06',
    description: 'Grocery Store',
    category: 'Food & Dining',
    amount: -2400,
    status: 'completed' as const,
  },
  // Page 3
  {
    id: '11',
    date: '2024-01-05',
    description: 'Medical Checkup',
    category: 'Healthcare',
    amount: -5000,
    status: 'completed' as const,
  },
  {
    id: '12',
    date: '2024-01-04',
    description: 'Online Course',
    category: 'Others',
    amount: -2999,
    status: 'completed' as const,
  },
  {
    id: '13',
    date: '2024-01-03',
    description: 'Electricity Bill',
    category: 'Bills',
    amount: -1200,
    status: 'completed' as const,
  },
  {
    id: '14',
    date: '2024-01-02',
    description: 'Gym Membership',
    category: 'Others',
    amount: -3000,
    status: 'completed' as const,
  },
  {
    id: '15',
    date: '2024-01-01',
    description: 'New Year Celebration',
    category: 'Entertainment',
    amount: -8500,
    status: 'completed' as const,
  },
];

export default function Transactions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const transactionsPerPage = 5;
  const totalPages = Math.ceil(allMockTransactions.length / transactionsPerPage);

  const getCurrentTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return allMockTransactions.slice(startIndex, endIndex);
  };

  const handlePageChange = async (page: number) => {
    if (page === currentPage || isLoading) return;
    
    setIsLoading(true);
    
    // Simulate loading delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCurrentPage(page);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            View and manage your transaction history
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 sm:px-6 py-3 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center space-x-2 text-sm sm:text-base shadow-sm"
        >
          <CalendarDaysIcon className="w-4 h-4" />
          <span>Export CSV</span>
        </motion.button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row lg:flex-row gap-4 sm:gap-6">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-base"
            />
          </div>

          {/* Category Filter */}
          <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-3 sm:py-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white appearance-none text-base"
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
          <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-8 py-3 sm:py-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white appearance-none text-base"
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
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              All Transactions
            </h3>
          </div>
          
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
                <AnimatePresence mode="wait">
                  <motion.tr
                    key={`page-${currentPage}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <td colSpan={5} className="p-0">
                      <TransactionsTable
                        transactions={getCurrentTransactions()}
                        onPageChange={handlePageChange}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        loading={isLoading}
                        hideHeader={true}
                      />
                    </td>
                  </motion.tr>
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}