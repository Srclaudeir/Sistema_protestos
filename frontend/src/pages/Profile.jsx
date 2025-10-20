// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { authAPI } from "../services/api";

const Profile = () => {
  const { user, logout } = useAuth();
  const { getRoleLabel } = usePermissions();
  const [profileData, setProfileData] = useState({
    nome: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.nome || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await authAPI.updateProfile(profileData);
      setMessage("Perfil atualizado com sucesso!");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar perfil");
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("A nova senha e a confirmacao nao coincidem");
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage("Senha alterada com sucesso!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao alterar senha");
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-brand-muted/70 bg-white p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-deep/60">
            Perfil
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-deep">
            Preferencias do usuario
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Atualize seus dados pessoais e mantenha o acesso seguro ao painel
            corporativo.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center rounded-full border border-brand-purple px-5 py-2 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple hover:text-white"
        >
          Sair
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-brand-green/40 bg-brand-green/10 px-5 py-4 text-brand-deep">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-brand-muted/70 bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-brand-deep">
            Informacoes do perfil
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="mb-1 block text-sm font-semibold text-brand-deep/80"
              >
                Nome completo
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={profileData.nome}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-semibold text-brand-deep/80"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-500">
              <div className="space-y-1">
                <span className="font-semibold text-brand-deep/80">
                  Usuario
                </span>
                <div className="rounded-xl border border-brand-muted bg-brand-muted px-3 py-2 text-brand-deep">
                  {user.username}
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-brand-deep/80">Funcao</span>
                <div className="rounded-xl border border-brand-muted bg-brand-muted px-3 py-2 text-brand-deep">
                  {getRoleLabel()}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep"
            >
              Atualizar perfil
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-brand-muted/70 bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-brand-deep">
            Alterar senha
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1 block text-sm font-semibold text-brand-deep/80"
              >
                Senha atual
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                required
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1 block text-sm font-semibold text-brand-deep/80"
              >
                Nova senha
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-semibold text-brand-deep/80"
              >
                Confirmar nova senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep"
            >
              Alterar senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
