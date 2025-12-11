import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserButton } from '@clerk/clerk-react';
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
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// Artist portal navigation - available to all logged in users
const artistNavItems: NavItem[] = [
  { label: 'Profil', href: '/profil', icon: User },
  { label: 'Kalender', href: '/kalender', icon: Calendar },
  { label: 'Meine Gigs', href: '/meine-gigs', icon: FileText },
  { label: 'Meine Anfragen', href: '/meine-anfragen', icon: Clock },
];

// Admin navigation - only for admins
const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Künstler', href: '/admin/kuenstler', icon: Users },
  { label: 'Rechnungen', href: '/admin/rechnungen', icon: Receipt },
  { label: 'Anstehende Gigs', href: '/admin/anstehende-gigs', icon: Clock },
];

export function DashboardLayout({ children, className = '', title }: DashboardLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin check from Clerk publicMetadata role
  const isAdmin = user?.is_admin === true;
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Artists only see artist nav, Admins see both (admin first when on admin routes)
  const navItems = isAdmin
    ? (isAdminRoute ? [...adminNavItems, ...artistNavItems] : [...artistNavItems, ...adminNavItems])
    : artistNavItems;

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
        {/* Sidebar Header - Logo matching main nav */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
          <Link to="/" className="flex items-center">
            <img
              src="/logos/SVG/PEPE_logos_shows.svg"
              alt="Pepe Shows Logo"
              className="h-12 w-auto"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* Section Label for Admin */}
          {isAdmin && isAdminRoute && (
            <div className="mb-4 pb-2 border-b border-white/5">
              <span className="px-3 text-xs font-semibold text-[#D4A574] uppercase tracking-wider">
                Admin Bereich
              </span>
            </div>
          )}

          {/* Section Label for Artist Portal */}
          {!isAdminRoute && (
            <div className="mb-4 pb-2 border-b border-white/5">
              <span className="px-3 text-xs font-semibold text-[#D4A574] uppercase tracking-wider">
                Künstler Portal
              </span>
            </div>
          )}

          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            const isFirstAdminItem = isAdmin && !isAdminRoute && index === artistNavItems.length;
            const isFirstArtistItem = isAdmin && isAdminRoute && index === adminNavItems.length;

            return (
              <React.Fragment key={item.href}>
                {/* Separator between sections */}
                {(isFirstAdminItem || isFirstArtistItem) && (
                  <div className="my-4 pt-4 border-t border-white/5">
                    <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {isFirstAdminItem ? 'Admin' : 'Künstler'}
                    </span>
                  </div>
                )}
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#D4A574]/15 text-[#D4A574] border border-[#D4A574]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'text-[#D4A574]')} />
                  {item.label}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-[#111111]">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Zur Website
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
                className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {title && (
                <h1 className="text-lg font-semibold text-white">{title}</h1>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Admin Switch Button - only show to admins */}
              {isAdmin && (
                <Link
                  to={isAdminRoute ? '/profil' : '/admin'}
                  className={cn(
                    'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isAdminRoute
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-[#D4A574] bg-[#D4A574]/10 hover:bg-[#D4A574]/20'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {isAdminRoute ? 'Künstler Portal' : 'Admin'}
                </Link>
              )}

              {/* User Button from Clerk */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                    userButtonPopoverCard: "bg-[#1A1A1A] border border-white/10",
                    userButtonPopoverActionButton: "text-white hover:bg-white/10",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverFooter: "hidden",
                  }
                }}
              />
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
