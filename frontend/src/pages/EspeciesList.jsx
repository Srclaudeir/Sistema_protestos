// src/pages/EspeciesList.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { especiesAPI } from "../services/api";
import { usePermissions } from "../hooks/usePermissions";
// Implementação nativa de debounce com método cancel
const debounce = (func, wait) => {
  let timeout;
  const debouncedFunction = function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  debouncedFunction.cancel = () => {
    clearTimeout(timeout);
  };

  return debouncedFunction;
};

const EspeciesList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [especies, setEspecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  const fetchEspecies = useCallback(
    async (page = 1, search = "") => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: itemsPerPage,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        const response = await especiesAPI.getAll(params);
        const data = response.data;

        setEspecies(data.data || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
      } catch (err) {
        console.error("Erro ao carregar espécies:", err);
        setError("Não foi possível carregar as espécies. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setCurrentPage(1);
      fetchEspecies(1, searchValue);
    }, 500),
    [fetchEspecies]
  );

  useEffect(() => {
    fetchEspecies(currentPage, searchTerm);
  }, [fetchEspecies, currentPage]);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = async (id, nome) => {
    if (
      !window.confirm(`Tem certeza que deseja excluir a espécie "${nome}"?`)
    ) {
      return;
    }

    try {
      await especiesAPI.delete(id);
      setEspecies((prev) => prev.filter((especie) => especie.id !== id));
      setTotalItems((prev) => prev - 1);
    } catch (err) {
      console.error("Erro ao excluir espécie:", err);
      alert(
        err.response?.data?.message ||
          "Não foi possível excluir a espécie. Tente novamente."
      );
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (loading && especies.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      {/* Header */}
      <section className="rounded-3xl bg-gradient-to-r from-brand-navy via-brand-turquoise-dark to-brand-green px-8 py-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.32em] text-white/70">
          Administração
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Espécies de Contratos</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          Gerencie as espécies de contratos disponíveis no sistema.
        </p>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {canCreate() && (
          <button
            onClick={() => navigate("/especies/novo")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep"
          >
            <svg
              className="h-5 w-5"
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
            Nova Espécie
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-brand-deep">
          Busca e Filtros
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="search"
              className="mb-1 block text-sm font-semibold text-brand-deep/80"
            >
              Buscar espécies
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Digite o nome da espécie..."
                className="w-full rounded-xl border border-brand-muted/60 bg-white px-4 py-3 pr-12 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
              />
              <svg
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="mt-2 text-xs text-brand-muted">
              A busca é feita automaticamente conforme você digita
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Dica de scroll em telas pequenas */}
      <div className="lg:hidden mb-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
        <svg
          className="h-4 w-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Deslize a tabela horizontalmente para ver todos os campos →</span>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-brand-muted/60 bg-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-xs sm:text-sm min-w-[700px]">
            <thead className="bg-gradient-to-r from-brand-deep to-brand-turquoise text-white text-xs sm:text-sm">
              <tr>
                <th className="px-3 py-2 text-left font-semibold sm:px-4">
                  ID
                </th>
                <th className="px-3 py-2 text-left font-semibold sm:px-4">
                  Nome
                </th>
                <th className="px-3 py-2 text-left font-semibold sm:px-4">
                  Descrição
                </th>
                <th className="px-3 py-2 text-left font-semibold sm:px-4">
                  Status
                </th>
                <th className="px-3 py-2 text-left font-semibold sm:px-4">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/30 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
                      <span className="ml-3 text-brand-muted">
                        Carregando espécies...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : especies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-brand-muted">
                      <svg
                        className="mb-4 h-12 w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        {searchTerm
                          ? "Nenhuma espécie encontrada"
                          : "Nenhuma espécie cadastrada"}
                      </p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Tente ajustar os termos de busca"
                          : "Clique em 'Nova Espécie' para começar"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                especies.map((especie) => (
                  <tr
                    key={especie.id}
                    className="transition hover:bg-gray-50/80"
                  >
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 sm:px-4 whitespace-nowrap">
                      #{especie.id}
                    </td>
                    <td className="px-3 py-2 sm:px-4">
                      <div className="max-w-[10rem] sm:max-w-[12rem] lg:max-w-[14rem] text-sm font-medium text-gray-900 break-words">
                        {especie.nome}
                      </div>
                    </td>
                    <td className="px-3 py-2 sm:px-4">
                      <div className="max-w-[12rem] sm:max-w-[14rem] lg:max-w-[18rem] break-words text-sm text-gray-600">
                        {especie.descricao || "Sem descrição"}
                      </div>
                    </td>
                    <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                          especie.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {especie.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-2">
                        {canEdit() && (
                          <button
                            onClick={() =>
                              navigate(`/especies/editar/${especie.id}`)
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-turquoise/10 px-3 py-2 text-xs font-medium text-brand-turquoise transition hover:bg-brand-turquoise/20"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Editar
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() =>
                              handleDelete(especie.id, especie.nome)
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="rounded-2xl border border-brand-muted/60 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-brand-muted">
              Mostrando {startItem} a {endItem} de {totalItems} resultados
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-muted px-3 py-2 text-sm font-medium text-brand-deep transition hover:bg-brand-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Anterior
              </button>
              <span className="rounded-lg bg-brand-turquoise px-3 py-2 text-sm font-semibold text-white">
                {currentPage}
              </span>
              <span className="text-sm text-brand-muted">de {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-muted px-3 py-2 text-sm font-medium text-brand-deep transition hover:bg-brand-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próximo
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspeciesList;
