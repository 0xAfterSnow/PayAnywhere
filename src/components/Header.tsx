import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Docs', path: '/docs' },
];

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const { connected } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto pt-4 px-4">
        <div className="flex h-14 items-center justify-between rounded-2xl bg-background/80 backdrop-blur-2xl border border-border/40 px-5 shadow-sm">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-primary/12 group-hover:bg-primary/18 transition-colors" />
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="relative z-10">
                <path d="M7 0L13.0622 3.5V10.5L7 14L0.937822 10.5V3.5L7 0Z" fill="hsl(258,72%,58%)" />
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-foreground">
              Pay<span className="text-primary">Anywhere</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors
                    ${isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-primary/8"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            {connected && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/12">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-blue" />
                <span className="text-[11px] font-bold text-primary">Devnet</span>
              </div>
            )}
            <WalletMultiButton />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-4 mt-2 overflow-hidden"
          >
            <nav className="flex flex-col p-3 gap-1 bg-background/95 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-colors
                    ${pathname === link.path
                      ? 'text-foreground bg-primary/8'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
