// src/utils/pagination.js
const { Op } = require('sequelize');

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} Parsed pagination parameters
 */
const parsePaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  // Validate and sanitize parameters
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
  const validatedOffset = (validatedPage - 1) * validatedLimit;

  return {
    page: validatedPage,
    limit: validatedLimit,
    offset: validatedOffset
  };
};

/**
 * Build pagination response
 * @param {number} count - Total count of records
 * @param {Array} rows - Array of records
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Pagination response object
 */
const buildPaginationResponse = (count, rows, pagination) => {
  const totalPages = Math.ceil(count / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  return {
    success: true,
    count: rows.length,
    total: count,
    pages: totalPages,
    currentPage: pagination.page,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? pagination.page + 1 : null,
    prevPage: hasPrevPage ? pagination.page - 1 : null,
    data: rows
  };
};

/**
 * Parse sorting parameters from request query
 * @param {Object} query - Request query object
 * @param {Array} allowedFields - Array of allowed sort fields
 * @returns {Array|null} Sort parameters for Sequelize
 */
const parseSortParams = (query, allowedFields = []) => {
  if (!query.sort) return null;

  const sortParams = query.sort.split(',');
  const sortArray = [];

  for (const param of sortParams) {
    let [field, direction = 'ASC'] = param.split(':');
    direction = direction.toUpperCase();

    // Validate sort direction
    if (!['ASC', 'DESC'].includes(direction)) {
      direction = 'ASC';
    }

    // Validate field if allowed fields are specified
    if (allowedFields.length > 0 && !allowedFields.includes(field)) {
      continue; // Skip invalid field
    }

    sortArray.push([field, direction]);
  }

  return sortArray.length > 0 ? sortArray : null;
};

/**
 * Parse filter parameters from request query
 * @param {Object} query - Request query object
 * @param {Array} allowedFilters - Array of allowed filter parameters
 * @returns {Object} Filter object for Sequelize
 */
const parseFilterParams = (query, allowedFilters = []) => {
  const where = {};

  // Process each query parameter
  for (const [key, value] of Object.entries(query)) {
    // Skip pagination, sort, and search parameters
    if (['page', 'limit', 'sort', 'search'].includes(key)) {
      continue;
    }

    // Validate if the filter is allowed
    if (allowedFilters.length > 0 && !allowedFilters.includes(key)) {
      continue; // Skip invalid filter
    }

    // Handle different types of filters
    if (key.endsWith('_gte')) {
      // Greater than or equal: field_gte=value
      const field = key.replace('_gte', '');
      where[field] = { ...where[field], [Op.gte]: value };
    } else if (key.endsWith('_lte')) {
      // Less than or equal: field_lte=value
      const field = key.replace('_lte', '');
      where[field] = { ...where[field], [Op.lte]: value };
    } else if (key.endsWith('_gt')) {
      // Greater than: field_gt=value
      const field = key.replace('_gt', '');
      where[field] = { ...where[field], [Op.gt]: value };
    } else if (key.endsWith('_lt')) {
      // Less than: field_lt=value
      const field = key.replace('_lt', '');
      where[field] = { ...where[field], [Op.lt]: value };
    } else if (key.endsWith('_ne')) {
      // Not equal: field_ne=value
      const field = key.replace('_ne', '');
      where[field] = { ...where[field], [Op.ne]: value };
    } else if (key.endsWith('_in')) {
      // In array: field_in=value1,value2,value3
      const field = key.replace('_in', '');
      where[field] = { ...where[field], [Op.in]: Array.isArray(value) ? value : value.split(',') };
    } else if (key.endsWith('_like')) {
      // Like: field_like=value
      const field = key.replace('_like', '');
      where[field] = { ...where[field], [Op.like]: `%${value}%` };
    } else if (key.endsWith('_notlike')) {
      // Not like: field_notlike=value
      const field = key.replace('_notlike', '');
      where[field] = { ...where[field], [Op.notLike]: `%${value}%` };
    } else {
      // Direct equality
      where[key] = value;
    }
  }

  return where;
};

module.exports = {
  parsePaginationParams,
  buildPaginationResponse,
  parseSortParams,
  parseFilterParams
};