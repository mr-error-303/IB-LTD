import React from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-md mx-auto px-4 py-4 pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;