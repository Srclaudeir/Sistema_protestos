// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (event) => {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const result = await login(credentials);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-deep via-brand-turquoise to-brand-lime px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">Sistema Protestos</p>
          <h2 className="mt-3 text-3xl font-semibold">Acesso ao painel</h2>
          <p className="mt-2 text-sm text-white/80">
            Utilize suas credenciais para visualizar contratos, clientes e protestos em tempo real.
          </p>
        </div>

        <div className="rounded-3xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-brand-deep">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                placeholder="Digite seu usuario"
                value={credentials.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-brand-deep">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                placeholder="Digite sua senha"
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-brand-deep px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-turquoise"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
