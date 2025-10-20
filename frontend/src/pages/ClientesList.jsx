// src/pages/ClientesList.jsx
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { clientesAPI } from "../services/api";
import { usePermissions } from "../hooks/usePermissions";
import debounce from "lodash.debounce";

const ITEMS_PER_PAGE = 10;

const ClientesList = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);

  // Filtros
  const [tipoContaFilter, setTipoContaFilter] = useState("TODOS");
  const [cidadeFilter, setCidadeFilter] = useState("");

  const fetchClientes = useCallback(async (page, search, tipoConta, cidade) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search,
        tipo_conta: tipoConta !== "TODOS" ? tipoConta : undefined,
        cidade: cidade || undefined,
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await clientesAPI.getAll(params);
      const { data, pages, total } = response.data;

      setClientes(data);
      setTotalPages(pages);
      setTotalClientes(total);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setIsInitialLoad(false);
      setLoading(false);
    }
  }, []);

  // Debounced search - usar useMemo para manter a mesma instância
  const debouncedSearch = useMemo(
    () =>
      debounce((term, tipoConta, cidade) => {
        fetchClientes(1, term, tipoConta, cidade);
        setCurrentPage(1);
      }, 500),
    [fetchClientes]
  );

  useEffect(() => {
    fetchClientes(currentPage, searchTerm, tipoContaFilter, cidadeFilter);
  }, [currentPage, fetchClientes]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value, tipoContaFilter, cidadeFilter);
  };

  const handleTipoContaChange = (value) => {
    setTipoContaFilter(value);
    fetchClientes(1, searchTerm, value, cidadeFilter);
    setCurrentPage(1);
  };

  const handleCidadeChange = (value) => {
    setCidadeFilter(value);
    debouncedSearch(searchTerm, tipoContaFilter, value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cooperado?")) {
      try {
        await clientesAPI.delete(id);
        fetchClientes(currentPage, searchTerm, tipoContaFilter, cidadeFilter);
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startItem =
    totalClientes === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem =
    totalClientes === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, totalClientes);

  const activeFiltersCount =
    (tipoContaFilter !== "TODOS" ? 1 : 0) + (cidadeFilter ? 1 : 0);

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
          <h1 className="text-2xl font-semibold text-brand-deep">Cooperados</h1>
          <p className="text-sm text-slate-500">
            Controle da base cadastral com indicadores de relacionamento.
          </p>
        </div>
        {canCreate() && (
          <Link
            to="/clientes/novo"
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
            Novo Cooperado
          </Link>
        )}
      </div>

      {/* Busca e Filtros */}
      <div className="rounded-3xl border border-brand-muted/60 bg-white p-4 shadow-sm space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar cooperado por nome ou CPF/CNPJ (busca em tempo real)"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
            />
          </div>
          {searchTerm && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                A busca é automática após 500ms. Não precisa pressionar Enter.
              </span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo de Conta */}
          <div>
            <label className="block text-sm font-medium text-brand-deep mb-2">
              Tipo de Conta
            </label>
            <select
              value={tipoContaFilter}
              onChange={(e) => handleTipoContaChange(e.target.value)}
              className="w-full rounded-xl border border-brand-muted px-4 py-2 text-sm outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
            >
              <option value="TODOS">Todos</option>
              <option value="PF">Pessoa Física (PF)</option>
              <option value="PJ">Pessoa Jurídica (PJ)</option>
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-brand-deep mb-2">
              Cidade
            </label>
            <input
              type="text"
              value={cidadeFilter}
              onChange={(e) => handleCidadeChange(e.target.value)}
              placeholder="Nome da cidade"
              className="w-full rounded-xl border border-brand-muted px-4 py-2 text-sm outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
            />
          </div>

          {/* Limpar Filtros */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setTipoContaFilter("TODOS");
                setCidadeFilter("");
                setSearchTerm("");
                fetchClientes(1, "", "TODOS", "");
                setCurrentPage(1);
              }}
              className="w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de filtros */}
      {activeFiltersCount > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700">
          {activeFiltersCount} filtro(s) ativo(s) - {totalClientes} resultado(s)
          encontrado(s)
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

      <div className="relative rounded-3xl border border-brand-muted/70 bg-white shadow-xl overflow-hidden">
        {loading && !isInitialLoad && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full table-auto divide-y divide-brand-muted/60 text-xs sm:text-sm min-w-[800px]">
            <thead className="bg-brand-deep text-white text-xs sm:text-sm">
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
                  Tipo
                </th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  Cidade
                </th>
                <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/50 bg-white text-brand-deep">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-brand-muted/40">
                  <td className="px-3 py-2 font-semibold sm:px-4 whitespace-nowrap">
                    {cliente.id}
                  </td>
                  <td className="px-3 py-2 sm:px-4">
                    <div className="max-w-[10rem] sm:max-w-[12rem] lg:max-w-[16rem] text-sm font-medium text-brand-deep break-words">
                      {cliente.nome}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600 sm:px-4 whitespace-nowrap">
                    {cliente.cpf_cnpj}
                  </td>
                  <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        cliente.tipo_conta === "PF"
                          ? "bg-brand-turquoise/15 text-brand-turquoise border border-brand-turquoise/30"
                          : "bg-brand-green/15 text-brand-green border border-brand-green/30"
                      }`}
                    >
                      {cliente.tipo_conta}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600 sm:px-4 whitespace-nowrap">
                    {cliente.cidade || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium sm:px-4 whitespace-nowrap">
                    <div className="flex flex-wrap items-center gap-3">
                      {canEdit() && (
                        <Link
                          to={`/clientes/editar/${cliente.id}`}
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
                      )}
                      {canDelete() && (
                        <button
                          type="button"
                          onClick={() => handleDelete(cliente.id)}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    Nenhum cooperado localizado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-brand-muted/50 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div>
          Mostrando{" "}
          <span className="font-semibold text-brand-deep">{startItem}</span> a{" "}
          <span className="font-semibold text-brand-deep">{endItem}</span> de{" "}
          <span className="font-semibold text-brand-deep">{totalClientes}</span>{" "}
          resultados
        </div>
        <div className="flex items-center gap-2">
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
            Proxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientesList;
