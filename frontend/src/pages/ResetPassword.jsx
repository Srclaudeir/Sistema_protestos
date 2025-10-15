// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validações
    if (formData.newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (!token) {
      setError(
        "Token de recuperação não encontrado. Use o link enviado por email."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, formData.newPassword);

      if (response.data.success) {
        // Mostrar mensagem de sucesso e redirecionar para login
        alert(response.data.message);
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erro ao redefinir senha. Tente novamente."
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
          <h2 className="mt-3 text-3xl font-semibold">Redefinir Senha</h2>
          <p className="mt-2 text-sm text-white/80">
            Digite sua nova senha para redefinir o acesso à sua conta.
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
                htmlFor="newPassword"
                className="text-sm font-semibold text-brand-deep"
              >
                Nova Senha
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                placeholder="Digite sua nova senha"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-brand-deep"
              >
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                placeholder="Confirme sua nova senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Processando..." : "Redefinir Senha"}
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

export default ResetPassword;
