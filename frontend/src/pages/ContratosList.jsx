// src/pages/ContratosList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import debounce from "lodash.debounce";
import { contratosAPI } from "../services/api";

const ITEMS_PER_PAGE = 10;

const ContratosList = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContratos, setTotalContratos] = useState(0);

  // Filtros aplicados
  const [especieFilter, setEspecieFilter] = useState("");
  const [cidadeFilter, setCidadeFilter] = useState("");

  const fetchContratos = useCallback(async (page, search, especie, cidade) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search: search || undefined,
        especie: especie || undefined,
        cidade: cidade || undefined,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      const response = await contratosAPI.getAll(params);
      const { data, pages, total } = response.data;

      setContratos(data);
      setTotalPages(pages);
      setTotalContratos(total);
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
    } finally {
      setIsInitialLoad(false);
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((term, especie, cidade) => {
        fetchContratos(1, term, especie, cidade);
        setCurrentPage(1);
      }, 500),
    [fetchContratos]
  );

  useEffect(() => {
    fetchContratos(currentPage, searchTerm, especieFilter, cidadeFilter);
  }, [currentPage, fetchContratos]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value, especieFilter, cidadeFilter);
  };

  const handleEspecieChange = (value) => {
    setEspecieFilter(value);
    fetchContratos(1, searchTerm, value, cidadeFilter);
    setCurrentPage(1);
  };

  const handleCidadeChange = (value) => {
    setCidadeFilter(value);
    debouncedSearch(searchTerm, especieFilter, value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este contrato?")) {
      try {
        await contratosAPI.delete(id);
        fetchContratos(currentPage, searchTerm, especieFilter, cidadeFilter);
      } catch (error) {
        console.error("Erro ao excluir contrato:", error);
      }
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startItem =
    totalContratos === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem =
    totalContratos === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, totalContratos);

  const activeFiltersCount = (especieFilter ? 1 : 0) + (cidadeFilter ? 1 : 0);

  if (loading && isInitialLoad) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-brand-muted/70 bg-white p-6 shadow-lg md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">Contratos</h1>
          <p className="text-sm text-slate-500">
            Monitore os contratos ativos e simplifique o acesso ao cadastro.
          </p>
        </div>
        <Link
          to="/contratos/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep"
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
          Novo Contrato
        </Link>
      </div>

      <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar contrato por número ou cooperado"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
            />
          </div>
          {searchTerm && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-deep">
              Espécie
            </label>
            <input
              value={especieFilter}
              onChange={(e) => handleEspecieChange(e.target.value)}
              placeholder="Identificação da espécie"
              className="w-full rounded-xl border border-brand-muted px-4 py-2 text-sm outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-deep">
              Cidade
            </label>
            <input
              value={cidadeFilter}
              onChange={(e) => handleCidadeChange(e.target.value)}
              placeholder="Nome da cidade"
              className="w-full rounded-xl border border-brand-muted px-4 py-2 text-sm outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setEspecieFilter("");
                setCidadeFilter("");
                setSearchTerm("");
                fetchContratos(1, "", "", "");
                setCurrentPage(1);
              }}
              className="w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {activeFiltersCount} filtro(s) ativo(s) - {totalContratos}{" "}
          resultado(s) encontrado(s)
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

      <div className="relative overflow-hidden rounded-3xl border border-brand-muted/70 bg-white shadow-xl">
        {loading && !isInitialLoad && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-brand-muted/60 text-xs sm:text-sm min-w-[900px]">
            <thead className="bg-brand-deep text-white text-xs sm:text-sm">
              <tr>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  ID
                </th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  Contrato SISBR
                </th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  Cooperado
                </th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  Espécie
                </th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  Cidade
                </th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  Ponto Atendimento
                </th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/40 bg-white text-brand-deep">
              {contratos.map((contrato) => (
                <tr
                  key={contrato.id}
                  className="transition-colors hover:bg-brand-muted/40"
                >
                  <td className="px-3 py-2 font-semibold sm:px-4 whitespace-nowrap">
                    #{contrato.id}
                  </td>
                  <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                    <div className="font-medium text-brand-deep">
                      {contrato.numero_contrato_sisbr || "N/A"}
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-4">
                    <div className="max-w-[10rem] sm:max-w-[12rem] lg:max-w-[16rem] text-sm text-slate-600 break-words">
                      {contrato.cliente?.nome || "N/A"}
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center rounded-full border border-brand-purple/30 bg-brand-purple/15 px-2 py-1 text-xs font-semibold text-brand-purple">
                      {contrato.especie || "N/A"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600 sm:px-4 whitespace-nowrap">
                    {contrato.cidade || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600 sm:px-4">
                    <div className="max-w-[8rem] sm:max-w-[10rem] break-words text-sm text-slate-600">
                      {contrato.ponto_atendimento || "N/A"}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm font-medium sm:px-4 whitespace-nowrap">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={`/contratos/editar/${contrato.id}`}
                        className="flex items-center gap-1 rounded-lg bg-brand-turquoise/10 px-3 py-1 text-xs font-semibold text-brand-turquoise transition hover:bg-brand-turquoise hover:text-white"
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
                        onClick={() => handleDelete(contrato.id)}
                        className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
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
                            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contratos.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-sm text-slate-500 sm:px-6"
                  >
                    Nenhum contrato localizado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand-muted/50 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          Mostrando{" "}
          <span className="font-semibold text-brand-deep">{startItem}</span> a{" "}
          <span className="font-semibold text-brand-deep">{endItem}</span> de{" "}
          <span className="font-semibold text-brand-deep">
            {totalContratos}
          </span>{" "}
          resultados
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              currentPage === 1
                ? "cursor-not-allowed bg-brand-muted text-slate-400"
                : "bg-brand-turquoise/15 text-brand-turquoise hover:bg-brand-turquoise hover:text-white"
            }`}
          >
            Anterior
          </button>

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
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  currentPage === page
                    ? "bg-brand-deep text-white"
                    : "bg-brand-muted text-brand-deep hover:bg-brand-turquoise hover:text-white"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              currentPage === totalPages
                ? "cursor-not-allowed bg-brand-muted text-slate-400"
                : "bg-brand-turquoise/15 text-brand-turquoise hover:bg-brand-turquoise hover:text-white"
            }`}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContratosList;
