// src/pages/AvalistasList.jsx
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { avalistasAPI } from "../services/api";
import debounce from "lodash.debounce";

const ITEMS_PER_PAGE = 10;

const AvalistasList = () => {
  const [avalistas, setAvalistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAvalistas, setTotalAvalistas] = useState(0);

  // Filtros
  const [nomeFilter, setNomeFilter] = useState("");
  const [cpfCnpjFilter, setCpfCnpjFilter] = useState("");

  const fetchAvalistas = useCallback(async (page, search, nome, cpfCnpj) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search,
        nome: nome || undefined,
        cpf_cnpj: cpfCnpj || undefined,
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await avalistasAPI.getAll(params);
      const { data, pages, total } = response.data;

      setAvalistas(data);
      setTotalPages(pages);
      setTotalAvalistas(total);
    } catch (error) {
      console.error("Erro ao buscar avalistas:", error);
    } finally {
      setIsInitialLoad(false);
      setLoading(false);
    }
  }, []);

  // Debounced search - usar useMemo para manter a mesma instância
  const debouncedSearch = useMemo(
    () =>
      debounce((term, nome, cpfCnpj) => {
        fetchAvalistas(1, term, nome, cpfCnpj);
        setCurrentPage(1);
      }, 500),
    [fetchAvalistas]
  );

  useEffect(() => {
    fetchAvalistas(currentPage, searchTerm, nomeFilter, cpfCnpjFilter);
  }, [currentPage, fetchAvalistas]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value, nomeFilter, cpfCnpjFilter);
  };

  const handleNomeChange = (value) => {
    setNomeFilter(value);
    fetchAvalistas(1, searchTerm, value, cpfCnpjFilter);
    setCurrentPage(1);
  };

  const handleCpfCnpjChange = (value) => {
    setCpfCnpjFilter(value);
    debouncedSearch(searchTerm, nomeFilter, value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este avalista?")) {
      try {
        await avalistasAPI.delete(id);
        fetchAvalistas(currentPage, searchTerm, nomeFilter, cpfCnpjFilter);
      } catch (error) {
        console.error("Erro ao excluir avalista:", error);
      }
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startItem =
    totalAvalistas === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem =
    totalAvalistas === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, totalAvalistas);

  const activeFiltersCount = (nomeFilter ? 1 : 0) + (cpfCnpjFilter ? 1 : 0);

  if (loading && isInitialLoad) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-deep">Avalistas</h1>
              <p className="mt-1 text-sm text-slate-600">
                Acompanhe garantias vinculadas e agilize os contatos preventivos
              </p>
            </div>
            <Link
              to="/avalistas/novo"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep"
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
              Novo Avalista
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-xl">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-deep mb-4">
              Busca e Filtros
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome ou CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-brand-muted/60 px-4 py-3 pr-12 text-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-brand-turquoise">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
            {searchTerm && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Busca automática em tempo real</span>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-brand-deep mb-3">
                Nome
              </label>
              <input
                type="text"
                value={nomeFilter}
                onChange={(e) => handleNomeChange(e.target.value)}
                placeholder="Nome do avalista"
                className="w-full rounded-xl border border-brand-muted/60 px-4 py-3 text-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-deep mb-3">
                CPF/CNPJ
              </label>
              <input
                type="text"
                value={cpfCnpjFilter}
                onChange={(e) => handleCpfCnpjChange(e.target.value)}
                placeholder="CPF ou CNPJ"
                className="w-full rounded-xl border border-brand-muted/60 px-4 py-3 text-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setNomeFilter("");
                  setCpfCnpjFilter("");
                  setSearchTerm("");
                  fetchAvalistas(1, "", "", "");
                  setCurrentPage(1);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
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
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {activeFiltersCount > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">
                {activeFiltersCount} filtro(s) ativo(s)
              </span>
              <span className="text-blue-600">•</span>
              <span>{totalAvalistas} resultado(s) encontrado(s)</span>
            </div>
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
          <span>
            Deslize a tabela horizontalmente para ver todos os campos →
          </span>
        </div>

        {/* Table Section */}
        <div className="rounded-3xl border border-brand-muted/60 bg-white shadow-xl overflow-hidden">
          <div className="relative">
            {loading && !isInitialLoad && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full table-auto divide-y divide-brand-muted/60 text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-gradient-to-r from-brand-deep to-brand-turquoise text-white text-xs sm:text-sm">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Nome
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      CPF/CNPJ
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Protocolo
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-muted/30 bg-white">
                  {avalistas.map((avalista) => (
                    <tr
                      key={avalista.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-3 py-2 font-semibold text-brand-deep sm:px-4 whitespace-nowrap">
                        #{avalista.id}
                      </td>
                      <td className="px-3 py-2 sm:px-4">
                        <div className="max-w-[10rem] sm:max-w-[12rem] lg:max-w-[16rem] text-sm font-medium text-gray-900 break-words">
                          {avalista.nome}
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {avalista.cpf_cnpj}
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {avalista.protesto?.protocolo || "N/A"}
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            to={`/avalistas/editar/${avalista.id}`}
                            className="flex items-center gap-1 rounded-lg bg-brand-turquoise/10 px-3 py-1 text-xs font-medium text-brand-turquoise transition hover:bg-brand-turquoise hover:text-white"
                          >
                            <svg
                              className="h-3 w-3"
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
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(avalista.id)}
                            className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            <svg
                              className="h-3 w-3"
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
                        </div>
                      </td>
                    </tr>
                  ))}
                  {avalistas.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <div className="text-gray-500">
                            <p className="text-sm font-medium">
                              Nenhum avalista encontrado
                            </p>
                            <p className="text-xs">
                              Tente ajustar a busca ou criar um novo avalista
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-brand-muted/60 bg-white px-6 py-4 shadow-sm sm:flex-row">
          <div className="text-sm text-gray-600">
            Mostrando{" "}
            <span className="font-semibold text-brand-deep">{startItem}</span> a{" "}
            <span className="font-semibold text-brand-deep">{endItem}</span> de{" "}
            <span className="font-semibold text-brand-deep">
              {totalAvalistas}
            </span>{" "}
            resultados
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                currentPage === 1
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
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

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                let page;
                if (totalPages <= 5) {
                  page = index + 1;
                } else if (currentPage <= 3) {
                  page = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + index;
                } else {
                  page = currentPage - 2 + index;
                }

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      currentPage === page
                        ? "bg-brand-turquoise text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                currentPage === totalPages
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Próxima
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
    </div>
  );
};

export default AvalistasList;
