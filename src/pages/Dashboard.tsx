import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/ui/StatCard';
import TransactionsTable from '../components/tables/TransactionsTable';
import {
  CreditCardIcon,
  BanknotesIcon,
  GiftIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';

// Mock data
const stats = [
  {
    title: 'Credit Limit',
    value: 500000,
    icon: CreditCardIcon,
    color: 'blue' as const,
    change: 5.4,
  },
  {
    title: 'Outstanding Balance',
    value: 45320,
    icon: BanknotesIcon,
    color: 'red' as const,
    change: -12.3,
  },
  {
    title: 'Rewards Points',
    value: 12580,
    icon: GiftIcon,
    color: 'green' as const,
    format: 'number' as const,
    change: 23.1,
  },
];

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
];

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const totalPages = Math.ceil(mockTransactions.length / transactionsPerPage);
  
  const getCurrentTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return mockTransactions.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-600 rounded p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-sm"
      >
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Welcome back, John</h1>
          <p className="text-primary-100 mb-4">
            Your account overview
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <div className="bg-white/10 rounded px-5 py-3">
              <span className="text-sm font-medium">Available Credit</span>
              <p className="text-xl sm:text-2xl font-bold">₹4,54,680</p>
            </div>
            <div className="bg-white/10 rounded px-5 py-3">
              <span className="text-sm font-medium">Next Payment Due</span>
              <p className="text-xl sm:text-2xl font-bold">Jan 25</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            format={stat.format}
            change={stat.change}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { name: 'Pay Bill', icon: BanknotesIcon, color: 'bg-success-500' },
            { name: 'View Statement', icon: ChartBarSquareIcon, color: 'bg-primary-500' },
            { name: 'Block Card', icon: CreditCardIcon, color: 'bg-error-500' },
            { name: 'Rewards', icon: GiftIcon, color: 'bg-warning-500' },
          ].map((action) => (
            <motion.button
              key={action.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 sm:p-6 rounded bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center group"
            >
              <div className={`w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 ${action.color} rounded flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform`}>
                <action.icon className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
              </div>
              <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
                {action.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TransactionsTable
          transactions={getCurrentTransactions()}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </motion.div>
    </div>
  );
}