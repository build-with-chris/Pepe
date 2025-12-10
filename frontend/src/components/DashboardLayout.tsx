import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function DashboardLayout({ children, className = '', title }: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-12 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>
        )}
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
