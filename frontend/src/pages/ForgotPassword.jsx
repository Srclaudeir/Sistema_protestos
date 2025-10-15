// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);

      if (response.data.success) {
        setSuccess(response.data.message);
        setEmail("");

        // Se estiver em desenvolvimento, mostrar o token
        if (response.data.data?.resetToken) {
          console.log("Token de reset (dev):", response.data.data.resetToken);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erro ao processar solicitação. Tente novamente."
      );
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
          <h2 className="mt-3 text-3xl font-semibold">Recuperar Senha</h2>
          <p className="mt-2 text-sm text-white/80">
            Digite seu email para receber instruções de recuperação de senha.
          </p>
        </div>

        <div className="rounded-3xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Processando..." : "Enviar Link de Recuperação"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-brand-deep hover:text-brand-turquoise transition"
            >
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
