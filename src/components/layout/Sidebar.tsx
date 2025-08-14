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
      {/* Mobile/Tablet Backdrop */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 shadow-xl"
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-600">
                    <CreditCardIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                    CreditFlow
                  </span>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onToggle}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 p-3">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <div key={item.name} className="relative">
                      <NavLink
                        to={item.href}
                        onClick={onToggle} // Close sidebar on navigation
                        className={clsx(
                          'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 relative',
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            'h-5 w-5 flex-shrink-0 transition-colors mr-3',
                            isActive
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                          )}
                        />
                        <span>{item.name}</span>
                      </NavLink>
                    </div>
                  );
                })}
              </nav>
              
              {/* Footer */}
              <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                  © 2024 CreditFlow
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Collapsed Sidebar Indicator */}
      <AnimatePresence>
        {collapsed && (
          <motion.button
            initial={{ x: -48 }}
            animate={{ x: 0 }}
            exit={{ x: -48 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={onToggle}
            className="hidden lg:flex fixed top-4 left-4 z-40 w-10 h-10 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}