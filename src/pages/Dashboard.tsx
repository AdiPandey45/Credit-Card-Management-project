import React from 'react';
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
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome back, John</h1>
          <p className="text-primary-100 mb-4">
            Your account overview
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="bg-white/10 rounded px-4 py-2">
              <span className="text-sm font-medium">Available Credit</span>
              <p className="text-lg sm:text-xl font-bold">₹4,54,680</p>
            </div>
            <div className="bg-white/10 rounded px-4 py-2">
              <span className="text-sm font-medium">Next Payment Due</span>
              <p className="text-lg sm:text-xl font-bold">Jan 25</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
        className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 shadow-card border border-neutral-200 dark:border-neutral-700"
      >
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
              className="p-3 sm:p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-center group"
            >
              <div className={`w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                <action.icon className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
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