// src/hooks/usePermissions.js
import { useAuth } from "./useAuth";

/**
 * Hook personalizado para gerenciar permissões baseadas em roles
 * @returns {Object} Funções de verificação de permissões
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Verifica se o usuário pode visualizar
   * @returns {boolean}
   */
  const canView = () => {
    // Todos os usuários autenticados podem visualizar
    return !!user;
  };

  /**
   * Verifica se o usuário pode criar novos registros
   * @returns {boolean}
   */
  const canCreate = () => {
    if (!user) return false;
    // Consultor não pode criar
    return user.role !== "consultor";
  };

  /**
   * Verifica se o usuário pode editar registros
   * @returns {boolean}
   */
  const canEdit = () => {
    if (!user) return false;
    // Consultor não pode editar
    return user.role !== "consultor";
  };

  /**
   * Verifica se o usuário pode excluir registros
   * @returns {boolean}
   */
  const canDelete = () => {
    if (!user) return false;
    // Apenas supervisor e admin podem excluir
    return user.role === "supervisor" || user.role === "admin";
  };

  /**
   * Verifica se o usuário pode gerenciar outros usuários
   * @returns {boolean}
   */
  const canManageUsers = () => {
    if (!user) return false;
    // Apenas admin pode gerenciar usuários
    return user.role === "admin";
  };

  /**
   * Verifica se o usuário é admin
   * @returns {boolean}
   */
  const isAdmin = () => {
    return user?.role === "admin";
  };

  /**
   * Verifica se o usuário é supervisor
   * @returns {boolean}
   */
  const isSupervisor = () => {
    return user?.role === "supervisor";
  };

  /**
   * Verifica se o usuário é operador
   * @returns {boolean}
   */
  const isOperador = () => {
    return user?.role === "operador";
  };

  /**
   * Verifica se o usuário é consultor
   * @returns {boolean}
   */
  const isConsultor = () => {
    return user?.role === "consultor";
  };

  /**
   * Retorna o nome amigável do role
   * @returns {string}
   */
  const getRoleLabel = () => {
    if (!user) return "";

    const roleLabels = {
      admin: "Administrador",
      supervisor: "Supervisor",
      operador: "Operador",
      consultor: "Consultor",
    };

    return roleLabels[user.role] || user.role;
  };

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManageUsers,
    isAdmin,
    isSupervisor,
    isOperador,
    isConsultor,
    getRoleLabel,
    userRole: user?.role,
  };
};

export default usePermissions;
