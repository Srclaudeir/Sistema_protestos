// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Carregar username salvo ao montar o componente
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setCredentials((prev) => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (event) => {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(credentials);

      if (result.success) {
        // Salvar ou remover username baseado no "Lembre-me"
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", credentials.username);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-deep via-brand-turquoise to-brand-lime px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-white/40 bg-white p-2 shadow-2xl">
              <img
                src="/vite.svg"
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">
            Sistema Protestos
          </p>
          <h2 className="mt-3 text-3xl font-semibold">Acesso ao painel</h2>
          <p className="mt-2 text-sm text-white/80">
            Utilize suas credenciais para visualizar contratos, clientes e
            protestos em tempo real.
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
              <label
                htmlFor="username"
                className="text-sm font-semibold text-brand-deep"
              >
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-brand-deep"
              >
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
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-turquoise focus:ring-brand-turquoise"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-brand-deep">Lembre-me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-brand-deep hover:text-brand-turquoise transition"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="font-semibold text-brand-deep hover:text-brand-turquoise transition"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
