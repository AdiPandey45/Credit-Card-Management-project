import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check if it's a large screen
      const isLargeScreen = window.innerWidth >= 1024;
      const saved = localStorage.getItem('sidebar-collapsed');
      
      // Default to collapsed on large screens, expanded on smaller screens
      if (saved !== null) {
        return saved === 'true';
      }
      return isLargeScreen;
    }
    return true; // Default collapsed for SSR
  });
  const { theme } = useTheme();

  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', newCollapsed.toString());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Overlay Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      {/* Main Content Area - Always Full Width */}
      <div className="min-h-screen">
        {/* Top Navigation with Centered Container */}
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TopNav onMenuClick={toggleSidebar} collapsed={sidebarCollapsed} />
          </div>
        </nav>
        
        {/* Main Content with Centered Container */}
        <main className="w-full">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}