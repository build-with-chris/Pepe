import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export function DashboardCard({ children, className, title, onClick }: DashboardCardProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6',
        onClick && 'cursor-pointer hover:bg-white/10 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

export default DashboardCard;
