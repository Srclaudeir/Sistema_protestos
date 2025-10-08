// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems } from '../../constants/navigation';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden min-h-screen w-72 flex-col bg-gradient-to-b from-brand-navy via-brand-deep to-brand-forest text-white shadow-2xl lg:flex">
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold tracking-tight">
          SP
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Protestos</p>
          <h1 className="text-xl font-semibold">Gestao Financeira</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                  active ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'
                }`}
              >
                {item.icon('h-5 w-5')}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 text-xs text-white/60">
        <p className="leading-snug">
          Tenha visibilidade completa sobre clientes, contratos e protestos com a nova identidade visual turquesa.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
