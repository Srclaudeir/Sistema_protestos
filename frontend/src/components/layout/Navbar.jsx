// src/components/layout/Navbar.jsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { navigationItems } from '../../constants/navigation';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = useMemo(() => {
    if (user?.nome) {
      return user.nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((namePart) => namePart.charAt(0).toUpperCase())
        .join('');
    }
    return 'SP';
  }, [user]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-brand-muted/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-brand-turquoise/40 bg-brand-turquoise/10 px-3 py-2 text-brand-deep transition-colors hover:bg-brand-turquoise hover:text-white lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-deep/60">Sistema</p>
            <h2 className="text-lg font-semibold text-brand-deep">Painel Corporativo</h2>
          </div>
          <div className="lg:hidden">
            <h2 className="text-base font-semibold text-brand-deep">Sistema Protestos</h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-brand-deep">{user?.nome ?? 'Usuario'}</span>
            <span className="text-xs text-slate-500">{user?.role ?? 'Operador'}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand-deep">
            {initials}
          </div>
          <button
            type="button"
            onClick={logout}
            className="hidden rounded-full border border-brand-turquoise px-5 py-2 text-sm font-semibold text-brand-turquoise transition-colors hover:bg-brand-turquoise hover:text-white sm:inline-flex"
          >
            Sair
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-brand-muted/50 bg-white/95 px-4 pb-4 pt-2 shadow-lg lg:hidden">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-deep hover:bg-brand-muted"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-muted text-brand-deep/90">
                  {item.icon('h-4 w-4')}
                </span>
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="mt-2 w-full rounded-lg border border-brand-turquoise px-3 py-2 text-sm font-semibold text-brand-turquoise hover:bg-brand-turquoise hover:text-white"
            >
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
