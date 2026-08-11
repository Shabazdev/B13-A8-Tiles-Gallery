/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppRoute, User, Tile } from './types';
import { TILES_DATA } from './data/tiles';
import { useAuth } from './context/AuthContext';

// Import Custom Modular Components
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Import Custom Views
import HomeView from './components/HomeView';
import AllTilesView from './components/AllTilesView';
import TileDetailsView from './components/TileDetailsView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ProfileView from './components/ProfileView';
import UpdateProfileView from './components/UpdateProfileView';
import NotFoundView from './components/NotFoundView';

import { Loader2 } from 'lucide-react';

export default function App() {
  // ── Auth state comes from Firebase via AuthContext ──────────────────────
  const { currentUser, authLoading, logout } = useAuth();

  // ── Router state ─────────────────────────────────────────────────────────
  const [currentRoute, setCurrentRoute] = useState<AppRoute>({ name: 'home' });
  const [isLoading, setIsLoading] = useState(false);

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // ── Hash-based Router ─────────────────────────────────────────────────────
  useEffect(() => {
    const parseHash = (): AppRoute => {
      const hash = window.location.hash;
      if (!hash || hash === '#/' || hash === '#') return { name: 'home' };
      if (hash === '#/all-tiles') return { name: 'all-tiles' };
      if (hash === '#/login') return { name: 'login' };
      if (hash === '#/register') return { name: 'register' };
      if (hash === '#/my-profile') return { name: 'my-profile' };
      if (hash === '#/update-profile') return { name: 'update-profile' };
      if (hash.startsWith('#/tile/')) {
        const id = hash.split('/').pop() ?? '';
        return { name: 'tile-detail', id };
      }
      return { name: 'home' }; // fallback
    };

    const handleHashChange = () => {
      const route = parseHash();

      // 🚦 Private Route Guard — requires Firebase auth
      const isPrivateRoute =
        route.name === 'my-profile' ||
        route.name === 'update-profile' ||
        route.name === 'tile-detail';

      // Wait until Firebase resolves initial auth before enforcing guards
      if (isPrivateRoute && !authLoading && !currentUser) {
        triggerToast('Please sign in to view this page.', 'error');
        window.location.hash = '#/login';
        return;
      }

      setIsLoading(true);
      const timer = setTimeout(() => {
        setCurrentRoute(route);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, authLoading]);

  // ── Navigation helper ─────────────────────────────────────────────────────
  const navigateTo = (route: AppRoute) => {
    const map: Record<string, string> = {
      home: '#/',
      'all-tiles': '#/all-tiles',
      login: '#/login',
      register: '#/register',
      'my-profile': '#/my-profile',
      'update-profile': '#/update-profile',
    };
    if (route.name === 'tile-detail') {
      window.location.hash = `#/tile/${(route as { name: 'tile-detail'; id: string }).id}`;
    } else {
      window.location.hash = map[route.name] ?? '#/';
    }
  };

  // ── Auth Callbacks (passed to views) ──────────────────────────────────────

  /** Called by LoginView after a successful Firebase login */
  const handleLoginSuccess = (user: User) => {
    triggerToast(`Welcome back, ${user.name}!`, 'success');
    setTimeout(() => navigateTo({ name: 'home' }), 400);
  };

  /** Called by RegisterView after successful Firebase registration */
  const handleRegisterSuccess = () => {
    triggerToast('Account created! Please sign in with your new credentials.', 'success');
    navigateTo({ name: 'login' });
  };

  /** Called by Header logout button */
  const handleLogout = async () => {
    await logout();
    triggerToast('You have been signed out.', 'info');
    navigateTo({ name: 'home' });
  };

  const handleUpdateProfileSuccess = (updatedUser: User, message: string) => {
    triggerToast(message, 'success');
    navigateTo({ name: 'my-profile' });
  };

  const handleAddToCart = (tileName: string) => {
    triggerToast(`Studio sample ordered for "${tileName}"! Check your email.`, 'success');
  };

  // ── Route Renderer ────────────────────────────────────────────────────────
  const featuredTiles: Tile[] = TILES_DATA.slice(0, 4);

  const renderView = () => {
    switch (currentRoute.name) {
      case 'home':
        return (
          <HomeView
            featuredTiles={featuredTiles}
            onNavigate={navigateTo}
            onViewDetails={(id) => navigateTo({ name: 'tile-detail', id })}
          />
        );
      case 'all-tiles':
        return (
          <AllTilesView
            tiles={TILES_DATA}
            onViewDetails={(id) => navigateTo({ name: 'tile-detail', id })}
          />
        );
      case 'tile-detail': {
        const tile = TILES_DATA.find((t) => t.id === (currentRoute as { id: string }).id);
        return tile ? (
          <TileDetailsView tile={tile} onNavigate={navigateTo} onAddToCart={handleAddToCart} />
        ) : (
          <NotFoundView onNavigate={navigateTo} />
        );
      }
      case 'login':
        return (
          <LoginView
            onNavigate={navigateTo}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'register':
        return (
          <RegisterView
            onNavigate={navigateTo}
            onRegisterSuccess={handleRegisterSuccess}
            onGoogleSuccess={handleLoginSuccess}
          />
        );
      case 'my-profile':
        return <ProfileView currentUser={currentUser} onNavigate={navigateTo} />;
      case 'update-profile':
        return (
          <UpdateProfileView
            currentUser={currentUser}
            onNavigate={navigateTo}
            onUpdateSuccess={handleUpdateProfileSuccess}
          />
        );
      default:
        return <NotFoundView onNavigate={navigateTo} />;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-neutral-800">

      {/* Navbar */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Page transition / auth loading spinner */}
      <AnimatePresence>
        {(isLoading || authLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
              <span className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
                {authLoading ? 'Checking session…' : 'Loading…'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main view */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={
              currentRoute.name +
              (currentRoute.name === 'tile-detail'
                ? (currentRoute as { id: string }).id
                : '')
            }
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
