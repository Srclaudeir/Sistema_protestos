// src/utils/dateFormatter.js
/**
 * Formata uma data para o formato brasileiro DD/MM/YYYY
 * @param {string|Date} value - Data a ser formatada (pode ser YYYY-MM-DD, ISO string, ou Date object)
 * @param {string} fallback - Valor de fallback se a data for inválida (padrão: "N/A")
 * @returns {string} Data formatada em DD/MM/YYYY ou valor de fallback
 */
export const formatDate = (value, fallback = "N/A") => {
  if (!value) {
    return fallback;
  }

  // Se a data vier no formato YYYY-MM-DD do backend (mais comum)
  if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  // Se a data vier no formato DD/MM/YYYY (já formatada)
  if (typeof value === "string" && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return value;
  }

  // Fallback para outros formatos (ISO string, timestamp, etc)
  try {
    // Se for uma string ISO (YYYY-MM-DDTHH:mm:ss.sssZ), extrair apenas a data
    if (typeof value === "string" && value.includes("T")) {
      const datePart = value.split("T")[0];
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}/${year}`;
    }

    // Para Date objects, usar UTC para evitar problemas de timezone
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return fallback;
    }

    // Usar UTC para evitar mudança de dia por timezone
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return fallback;
  }
};

/**
 * Converte uma data do formato brasileiro DD/MM/YYYY para YYYY-MM-DD (formato do backend)
 * @param {string} brazilianDate - Data no formato DD/MM/YYYY
 * @returns {string|null} Data no formato YYYY-MM-DD ou null se inválida
 */
export const toISODate = (brazilianDate) => {
  if (!brazilianDate) return null;

  const match = brazilianDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma data com hora para o formato brasileiro DD/MM/YYYY HH:mm
 * @param {string|Date} value - Data a ser formatada
 * @param {string} fallback - Valor de fallback se a data for inválida (padrão: "N/A")
 * @returns {string} Data formatada em DD/MM/YYYY HH:mm ou valor de fallback
 */
export const formatDateTime = (value, fallback = "N/A") => {
  if (!value) {
    return fallback;
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return fallback;
    }

    // Usar horário local para data/hora
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Erro ao formatar data/hora:", error);
    return fallback;
  }
};
