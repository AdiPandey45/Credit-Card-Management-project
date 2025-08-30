import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CreditCardIcon,
  BanknotesIcon,
  GiftIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

// Mock data for charts
const spendingData = [
  { month: 'Jan', amount: 12500 },
  { month: 'Feb', amount: 15200 },
  { month: 'Mar', amount: 18900 },
  { month: 'Apr', amount: 14300 },
  { month: 'May', amount: 22100 },
  { month: 'Jun', amount: 19800 },
];

const categoryData = [
  { category: 'Food & Dining', amount: 8500, percentage: 35, color: 'bg-orange-500' },
  { category: 'Shopping', amount: 6200, percentage: 26, color: 'bg-purple-500' },
  { category: 'Transport', amount: 3800, percentage: 16, color: 'bg-blue-500' },
  { category: 'Entertainment', amount: 2900, percentage: 12, color: 'bg-pink-500' },
  { category: 'Bills', amount: 2600, percentage: 11, color: 'bg-red-500' },
];

const rewardsData = [
  { month: 'Jan', points: 1250 },
  { month: 'Feb', points: 1520 },
  { month: 'Mar', points: 1890 },
  { month: 'Apr', points: 1430 },
  { month: 'May', points: 2210 },
  { month: 'Jun', points: 1980 },
];

export default function Analytics() {
  const maxSpending = Math.max(...spendingData.map(d => d.amount));
  const maxRewards = Math.max(...rewardsData.map(d => d.points));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your spending patterns and rewards earnings
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            title: 'Total Spent',
            value: '₹24,300',
            change: '+12.5%',
            trend: 'up',
            icon: BanknotesIcon,
            color: 'text-red-600 dark:text-red-400',
          },
          {
            title: 'Avg Monthly',
            value: '₹18,200',
            change: '+8.2%',
            trend: 'up',
            icon: ChartBarIcon,
            color: 'text-blue-600 dark:text-blue-400',
          },
          {
            title: 'Rewards Earned',
            value: '2,180 pts',
            change: '+15.3%',
            trend: 'up',
            icon: GiftIcon,
            color: 'text-green-600 dark:text-green-400',
          },
          {
            title: 'Transactions',
            value: '47',
            change: '-2.1%',
            trend: 'down',
            icon: CreditCardIcon,
            color: 'text-purple-600 dark:text-purple-400',
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-8 h-8 ${metric.color}`} />
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                )}
                {metric.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metric.title}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Spending Trends
            </h3>
            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {spendingData.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-4">
                <div className="w-8 text-sm text-gray-600 dark:text-gray-400">
                  {data.month}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.amount / maxSpending) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-900 dark:text-white text-right">
                  ₹{(data.amount / 1000).toFixed(1)}k
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Rewards Earned */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rewards Earned
            </h3>
            <GiftIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {rewardsData.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-4">
                <div className="w-8 text-sm text-gray-600 dark:text-gray-400">
                  {data.month}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.points / maxRewards) * 100}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-teal-500 to-green-600 rounded-full"
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-900 dark:text-white text-right">
                  {data.points}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Spending by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Donut Chart Representation */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {categoryData.map((category, index) => {
                  const offset = categoryData
                    .slice(0, index)
                    .reduce((sum, cat) => sum + cat.percentage, 0);
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${(category.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((offset / 100) * circumference);
                  
                  return (
                    <motion.circle
                      key={category.category}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={category.color.replace('bg-', '').replace('-500', '')}
                      strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className={`${category.color.replace('bg-', 'stroke-')}`}
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{ strokeDasharray }}
                      transition={{ delay: 0.8 + index * 0.2, duration: 1 }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹24.3k
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{category.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.percentage}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {[
          {
            title: 'Highest Spending Day',
            value: 'Friday',
            description: 'You spend most on weekends',
            color: 'bg-blue-500',
          },
          {
            title: 'Best Rewards Category',
            value: 'Dining',
            description: '5x points on restaurants',
            color: 'bg-green-500',
          },
          {
            title: 'Monthly Goal',
            value: '78%',
            description: '₹22k of ₹28k budget used',
            color: 'bg-orange-500',
          },
        ].map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className={`w-12 h-12 ${insight.color} rounded-xl flex items-center justify-center mb-4`}>
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {insight.value}
            </h4>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {insight.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {insight.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}