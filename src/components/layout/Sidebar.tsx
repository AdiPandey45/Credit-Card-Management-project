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
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Apply Card', href: '/apply', icon: CreditCardIcon },
  { name: 'Transactions', href: '/transactions', icon: TableCellsIcon },
  { name: 'Payments', href: '/payments', icon: BanknotesIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
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
          'bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700',
          'md:translate-x-0 shadow-lg',
          collapsed ? 'md:w-16 -translate-x-full md:translate-x-0' : 'md:w-64 -translate-x-full md:translate-x-0',
          !collapsed && 'translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <motion.div
              animate={{ scale: collapsed ? 0.8 : 1 }}
              className="flex items-center space-x-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-600">
                <CreditCardIcon className="h-5 w-5 text-white" />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-lg font-semibold text-neutral-900 dark:text-white overflow-hidden"
                  >
                    CreditFlow
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Collapse Toggle Button - Desktop Only */}
            <button
              onClick={onToggle}
              className="hidden md:flex p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {collapsed ? (
                <ChevronRightIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronLeftIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <div key={item.name} className="relative group">
                  <NavLink
                  to={item.href}
                  className={clsx(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 relative',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
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
                  </NavLink>
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  © 2024 CreditFlow
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}