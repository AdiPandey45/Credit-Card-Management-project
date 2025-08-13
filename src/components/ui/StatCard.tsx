import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  format?: 'currency' | 'number' | 'percentage';
}

const colorVariants = {
  blue: 'from-blue-500 to-indigo-600',
  green: 'from-green-500 to-teal-600',
  purple: 'from-purple-500 to-indigo-600',
  orange: 'from-orange-500 to-red-500',
  red: 'from-red-500 to-pink-600',
};

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  format = 'currency'
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value);

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `₹${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatValue(animatedValue)}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={clsx(
                'text-sm font-medium',
                change >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              )}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                from last month
              </span>
            </div>
          )}
        </div>
        <div className={clsx(
          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
          colorVariants[color]
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}