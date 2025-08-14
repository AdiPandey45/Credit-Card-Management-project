import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  HomeIcon,
  CreditCardIcon,
  TableCellsIcon,
  BanknotesIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Apply Card', href: '/apply', icon: CreditCardIcon },
  { name: 'Transactions', href: '/transactions', icon: TableCellsIcon },
  { name: 'Payments', href: '/payments', icon: BanknotesIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div className="md:hidden">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
              onClick={onToggle}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: collapsed ? 64 : 256,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={clsx(
          'fixed top-0 left-0 z-50 h-full transform transition-transform duration-300',
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl',
          'border-r border-gray-200 dark:border-gray-700',
          'md:translate-x-0',
          collapsed ? 'md:w-16 -translate-x-full md:translate-x-0' : 'md:w-64 -translate-x-full md:translate-x-0',
          !collapsed && 'translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <motion.div
              animate={{ scale: collapsed ? 0.8 : 1 }}
              className="flex items-center space-x-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <CreditCardIcon className="h-5 w-5 text-white" />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-lg font-semibold text-gray-900 dark:text-white overflow-hidden"
                  >
                    CreditFlow
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <div key={item.name} className="relative group">
                  <NavLink
                  to={item.href}
                  className={clsx(
                    'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    )}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                  </NavLink>
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </>
  );
}