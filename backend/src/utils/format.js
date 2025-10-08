// src/utils/format.js
/**
 * Format currency to BRL
 * @param {number} value 
 * @returns {string}
 */
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Format date to Brazilian format
 * @param {string|Date} date 
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return '';
  
  // Convert to Date object if it's a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  
  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Format datetime to Brazilian format
 * @param {string|Date} date 
 * @returns {string}
 */
const formatDateTime = (date) => {
  if (!date) return '';
  
  // Convert to Date object if it's a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  
  return dateObj.toLocaleString('pt-BR');
};

/**
 * Parse Brazilian date string (dd/mm/yyyy) to ISO date
 * @param {string} dateStr 
 * @returns {string|null}
 */
const parseBrazilianDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Check if date is already in ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr;
  }
  
  // Parse Brazilian date format (dd/mm/yyyy)
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  const date = new Date(year, month, day);
  
  // Check if date is valid
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }
  
  // Return ISO format
  return date.toISOString().split('T')[0];
};

/**
 * Validate CPF
 * @param {string} cpf 
 * @returns {boolean}
 */
const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]+/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Check for repeated digits
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

/**
 * Validate CNPJ
 * @param {string} cnpj 
 * @returns {boolean}
 */
const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  // Remove non-numeric characters
  cnpj = cnpj.replace(/[^\d]+/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // Check for repeated digits
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Validate first digit
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let remainder = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (remainder !== parseInt(digits.charAt(0))) return false;
  
  // Validate second digit
  length = length + 1;
  numbers = cnpj.substring(0, length);
  digits = cnpj.substring(length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  remainder = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (remainder !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

/**
 * Format CPF/CNPJ
 * @param {string} document 
 * @returns {string}
 */
const formatDocument = (document) => {
  if (!document) return '';
  
  // Remove non-numeric characters
  const cleanDoc = document.replace(/[^\d]+/g, '');
  
  // Format as CPF or CNPJ
  if (cleanDoc.length === 11) {
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleanDoc.length === 14) {
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return document;
};

module.exports = {
  formatCurrency,
  formatDate,
  formatDateTime,
  parseBrazilianDate,
  validateCPF,
  validateCNPJ,
  formatDocument
};