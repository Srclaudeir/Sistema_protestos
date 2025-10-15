// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nome: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      const { token } = response.data.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar conta");
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
          <h2 className="mt-3 text-3xl font-semibold">Criar nova conta</h2>
          <p className="mt-2 text-sm text-white/80">
            Preencha os dados abaixo para criar sua conta
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
                htmlFor="nome"
                className="text-sm font-semibold text-brand-deep"
              >
                Nome Completo
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                placeholder="Digite seu nome completo"
                value={formData.nome}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-semibold text-brand-deep"
              >
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                placeholder="Digite seu usuário"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-brand-deep"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                placeholder="Digite seu email"
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-deep hover:text-brand-turquoise transition"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
