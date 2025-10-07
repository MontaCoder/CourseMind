
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { appName } from '@/constants';
import Logo from '../res/logo.svg';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out px-6 lg:px-10",
        isScrolled
          ? "py-3 bg-white/80 dark:bg-background/80 backdrop-blur-2xl border-b border-border/60 shadow-[0_18px_46px_-32px_rgba(15,23,42,0.65)]"
          : "py-6"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        <Link to="/" className="group flex items-center space-x-4">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src={Logo} alt="Logo" className="relative h-12 md:h-14 max-w-[220px] w-auto object-contain" />
          </div>
          <span className="font-display text-lg md:text-xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 text-transparent text-gradient">
            {appName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 xl:space-x-4">
          {[{ href: '#features', label: 'Features' }, { href: '#how-it-works', label: 'How it works' }, { href: '#pricing', label: 'Pricing' }, { href: '#testimonials', label: 'Stories' }].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-primary/5"
            >
              <span className="mr-2 h-1 w-1 rounded-full bg-transparent transition-colors group-hover:bg-primary" />
              {item.label}
            </a>
          ))}
        </nav>

        {/* Call to Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          <Link to="/login" className="group">
            <Button variant="ghost" size="sm" className="relative overflow-hidden">
              <span className="absolute inset-0 translate-y-full bg-primary/10 transition-transform duration-300 group-hover:translate-y-0" />
              <span className="relative">Sign in</span>
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-indigo-500 shadow-lg shadow-primary/25 hover:shadow-primary/40">
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-indigo-400/20 to-primary/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              <span className="relative flex items-center gap-2">
                Launch App
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <ThemeToggle />
          <button
            aria-label="Toggle navigation"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-white/70 shadow-soft-xl transition-all duration-300 hover:border-primary/60 hover:shadow-[0_18px_40px_-28px_rgba(37,99,235,0.55)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-indigo-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative flex flex-col space-y-1.5">
              <span className={cn(
                "block h-0.5 w-6 origin-center bg-foreground transition-transform duration-300",
                isMobileMenuOpen && "translate-y-2 rotate-45"
              )} />
              <span className={cn(
                "block h-0.5 w-6 bg-foreground transition-opacity duration-300",
                isMobileMenuOpen && "opacity-0"
              )} />
              <span className={cn(
                "block h-0.5 w-6 origin-center bg-foreground transition-transform duration-300",
                isMobileMenuOpen && "-translate-y-2 -rotate-45"
              )} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden fixed inset-x-4 top-[84px] rounded-2xl border border-border/70 bg-white/90 dark:bg-background/95 px-6 py-6 shadow-[0_28px_60px_-40px_rgba(14,23,40,0.75)] transition-all duration-300",
        isMobileMenuOpen ? "opacity-100 visible" : "-translate-y-6 opacity-0 invisible"
      )}>
        <nav className="flex flex-col space-y-3">
          {[{ href: '#features', label: 'Features' }, { href: '#how-it-works', label: 'How it works' }, { href: '#pricing', label: 'Pricing' }, { href: '#testimonials', label: 'Stories' }].map((item) => (
            <a key={item.href} href={item.href} className="rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-6 flex flex-col space-y-2">
          <Link to="/login">
            <Button variant="outline" size="sm" className="w-full border-border/70 hover:border-primary/70">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="w-full bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90">Launch App</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
