// src/pages/UserManagement.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../services/api";
import { usePermissions } from "../hooks/usePermissions";

const ROLE_LABELS = {
  admin: "Administrador",
  supervisor: "Supervisor",
  operador: "Operador",
  consultor: "Consultor",
};

const ROLE_BADGE_CLASSES = {
  admin: "bg-red-100 text-red-700 border border-red-300",
  supervisor: "bg-blue-100 text-blue-700 border border-blue-300",
  operador: "bg-green-100 text-green-700 border border-green-300",
  consultor: "bg-gray-100 text-gray-700 border border-gray-300",
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { canManageUsers } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    nome: "",
    role: "operador",
  });

  // Redirecionar se não tiver permissão
  useEffect(() => {
    if (!canManageUsers()) {
      navigate("/");
    }
  }, [canManageUsers, navigate]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro ao carregar lista de usuários");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await usersAPI.create(newUser);
      setSuccess("Usuário criado com sucesso!");
      setShowCreateModal(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        nome: "",
        role: "operador",
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar usuário");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setError("");
    setSuccess("");

    try {
      await usersAPI.updateRole(userId, newRole);
      setSuccess("Perfil atualizado com sucesso!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar perfil");
    }
  };

  const handleToggleStatus = async (userId) => {
    setError("");
    setSuccess("");

    try {
      await usersAPI.toggleStatus(userId);
      setSuccess("Status do usuário alterado com sucesso!");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao alterar status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-deep">
                Gerenciamento de Usuários
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Gerencie usuários, permissões e status de acesso ao sistema
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Usuário
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-3xl border border-brand-muted/70 bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full table-auto divide-y divide-brand-muted/60 text-sm">
              <thead className="bg-brand-deep text-white text-xs sm:text-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide">
                    Perfil
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-muted/50 bg-white text-brand-deep">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-muted/40">
                    <td className="px-4 py-3 font-medium">{user.nome}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => {
                            handleUpdateRole(user.id, e.target.value);
                          }}
                          className="rounded-lg border border-brand-muted px-3 py-1 text-sm outline-none focus:border-brand-turquoise"
                        >
                          <option value="admin">Administrador</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="operador">Operador</option>
                          <option value="consultor">Consultor</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            ROLE_BADGE_CLASSES[user.role]
                          }`}
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          user.ativo
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                        }`}
                      >
                        {user.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editingUser === user.id ? (
                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                          >
                            Cancelar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingUser(user.id)}
                            className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                          >
                            Editar Perfil
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                            user.ativo
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {user.ativo ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-deep">
                Criar Novo Usuário
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 transition hover:text-slate-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-deep/80">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={newUser.nome}
                    onChange={(e) =>
                      setNewUser({ ...newUser, nome: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-deep/80">
                    Nome de Usuário *
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-deep/80">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-deep/80">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-deep/80">
                  Perfil *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
                >
                  <option value="operador">Operador</option>
                  <option value="consultor">Consultor</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-3 border-t border-brand-muted/40 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
