"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, Grid, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'All Tiles', path: '/all-tiles' },
    { name: 'My Profile', path: '/my-profile', private: true },
  ];

  const isActive = (routePath: string) => pathname === routePath;

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    showToast('You have been signed out.', 'info');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Website Logo */}
        <div 
          onClick={() => handleNavClick('/')}
          className="flex cursor-pointer items-center gap-2 text-neutral-900 transition-opacity hover:opacity-90"
          id="nav-logo"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Grid size={18} strokeWidth={2.5} />
          </div>
          <span className="font-sans text-lg font-bold tracking-tight">Tesserae</span>
        </div>

        {/* Centre: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`font-sans text-sm font-medium transition-colors hover:text-neutral-900 relative py-1 ${
                  active ? 'text-neutral-900 font-semibold' : 'text-neutral-500'
                }`}
              >
                {item.name}
                {active && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-neutral-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Auth Action Status (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavClick('/my-profile')}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 transition-all group-hover:ring-2 group-hover:ring-neutral-900">
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-500">
                      <UserIcon size={16} />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-neutral-900 leading-tight group-hover:underline">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono leading-none">
                    {currentUser.email}
                  </p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                id="btn-logout"
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-900"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('/login')}
              id="btn-login-header"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-100 bg-white px-4 py-4 space-y-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`text-left text-sm font-medium py-1.5 transition-colors ${
                  isActive(item.path) ? 'text-neutral-900 font-bold' : 'text-neutral-500'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <hr className="border-neutral-100" />

          {currentUser ? (
            <div className="space-y-4">
              <div 
                onClick={() => handleNavClick('/my-profile')}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="h-10 w-10 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-500">
                      <UserIcon size={18} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{currentUser.name}</p>
                  <p className="text-xs text-neutral-500 font-mono">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 transition-all hover:bg-neutral-50"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('/login')}
              className="w-full rounded-lg bg-neutral-900 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}

