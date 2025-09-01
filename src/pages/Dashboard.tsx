import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatCard from '../components/ui/StatCard';
import TransactionsTable from '../components/tables/TransactionsTable';
import BlockCardModal from '../components/ui/BlockCardModal';
import RewardsModal from '../components/ui/RewardsModal';
import PayBillModal from '../components/ui/PayBillModal';
import { useCards } from '../hooks/useCards';
import { useToast } from '../hooks/useToast';
import {
  CreditCardIcon,
  BanknotesIcon,
  GiftIcon,
  ChartBarSquareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

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
  const [outstandingBalance, setOutstandingBalance] = useState(45320);
  const [cardStatus, setCardStatus] = useState<'active' | 'blocked' | 'suspended'>('active');
  const [showBlockCardModal, setShowBlockCardModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  
  const navigate = useNavigate();
  const { getCardStatus } = useCards();
  const { showToast } = useToast();
  
  const transactionsPerPage = 5;
  const totalPages = Math.ceil(mockTransactions.length / transactionsPerPage);
  const minimumDue = 2266;
  const demoAccountId = '660e8400-e29b-41d4-a716-446655440000';

  // Check card status on component mount
  React.useEffect(() => {
    const checkCardStatus = async () => {
      try {
        const status = await getCardStatus(demoAccountId);
        if (status) {
          setCardStatus(status.status);
        }
      } catch (error) {
        console.error('Failed to fetch card status:', error);
      }
    };
    
    checkCardStatus();
  }, [getCardStatus]);
  
  const getCurrentTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return mockTransactions.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCardStatusChange = (newStatus: 'active' | 'blocked' | 'suspended') => {
    setCardStatus(newStatus);
  };

  const handlePaymentSuccess = (newBalance: number) => {
    setOutstandingBalance(newBalance);
    // Update the stats to reflect new balance
    stats[1].value = newBalance; // Outstanding Balance stat
  };

  const handleQuickAction = (actionName: string) => {
    switch (actionName) {
      case 'Pay Bill':
        setShowPayBillModal(true);
        break;
      case 'View Statement':
        navigate('/transactions');
        break;
      case 'Block Card':
        if (cardStatus === 'blocked') {
          showToast({
            type: 'info',
            title: 'Card Already Blocked',
            message: 'Your card is already temporarily blocked'
          });
        } else {
          setShowBlockCardModal(true);
        }
        break;
      case 'Rewards':
        setShowRewardsModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
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
        {/* Card Status Alert */}
        {cardStatus === 'blocked' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Your card is temporarily blocked
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Some services may be unavailable until you unblock your card
                </p>
              </div>
            </div>
          </div>
        )}
        
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { 
              name: 'Pay Bill', 
              icon: BanknotesIcon, 
              color: 'bg-green-500',
              disabled: cardStatus === 'blocked'
            },
            { 
              name: 'View Statement', 
              icon: ChartBarSquareIcon, 
              color: 'bg-blue-500',
              disabled: false
            },
            { 
              name: 'Block Card', 
              icon: CreditCardIcon, 
              color: cardStatus === 'blocked' ? 'bg-green-500' : 'bg-red-500',
              disabled: false,
              label: cardStatus === 'blocked' ? 'Unblock Card' : 'Block Card'
            },
            { 
              name: 'Rewards', 
              icon: GiftIcon, 
              color: 'bg-yellow-500',
              disabled: false
            },
          ].map((action, index) => (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction(action.name)}
              disabled={action.disabled}
              className={clsx(
                'p-4 sm:p-6 rounded transition-colors text-center group relative',
                action.disabled
                  ? 'bg-slate-100 dark:bg-slate-700/30 opacity-50 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              <div className={clsx(
                'w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded flex items-center justify-center mx-auto mb-3 transition-transform',
                action.disabled ? 'bg-slate-400' : `${action.color} group-hover:scale-105`
              )}>
                <action.icon className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
              </div>
              <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
                {action.label || action.name}
              </span>
              {action.disabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Card Blocked
                  </span>
                </div>
              )}
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
      
      {/* Modals */}
      <BlockCardModal
        isOpen={showBlockCardModal}
        onClose={() => setShowBlockCardModal(false)}
        cardId={demoAccountId}
        currentStatus={cardStatus}
        cardType="Platinum"
        cardNumber="****-****-****-9012"
        onSuccess={handleCardStatusChange}
      />
      
      <RewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
      />
      
      <PayBillModal
        isOpen={showPayBillModal}
        onClose={() => setShowPayBillModal(false)}
        outstandingBalance={outstandingBalance}
        minimumDue={minimumDue}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}