import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Calendar,
  FileText,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Receipt,
  Clock,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const userNavItems: NavItem[] = [
  { label: 'Profil', href: '/profil', icon: User },
  { label: 'Kalender', href: '/kalender', icon: Calendar },
  { label: 'Meine Gigs', href: '/meine-gigs', icon: FileText },
  { label: 'Meine Anfragen', href: '/meine-anfragen', icon: Clock },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, adminOnly: true },
  { label: 'Künstler', href: '/admin/kuenstler', icon: Users, adminOnly: true },
  { label: 'Rechnungen', href: '/admin/rechnungen', icon: Receipt, adminOnly: true },
  { label: 'Anstehende Gigs', href: '/admin/anstehende-gigs', icon: Clock, adminOnly: true },
];

export function DashboardLayout({ children, className = '', title }: DashboardLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.is_admin || user?.role === 'shows-admin';
  const isAdminRoute = location.pathname.startsWith('/admin');

  const navItems = isAdminRoute ? [...adminNavItems, ...userNavItems] : [...userNavItems, ...(isAdmin ? adminNavItems : [])];

  return (
    <div className={cn('min-h-screen bg-[#0A0A0A]', className)}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-[#111111] border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A574] to-[#B8956A] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-white">Pepe Shows</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {isAdminRoute && isAdmin && (
            <div className="mb-4">
              <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            if (item.adminOnly && !isAdmin) return null;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#D4A574]/20 text-[#D4A574]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to Home */}
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Zurück zur Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              {title && (
                <h1 className="text-lg font-semibold text-white">{title}</h1>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && !isAdminRoute && (
                <Link to="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
