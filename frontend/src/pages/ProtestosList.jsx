// src/pages/ProtestosList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import debounce from "lodash.debounce";

import { protestosAPI } from "../services/api";
import { formatDate } from "../utils/dateFormatter";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "ESPERANDO_PROTESTO", label: "Aguardando Protocolo" },
  { value: "PROTESTADO", label: "Protestado" },
  { value: "PAGO", label: "Pago" },
  { value: "DESISTENCIA", label: "Desistência" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "RETIRADO", label: "Retirado" },
  { value: "DEVOLVIDO", label: "Devolvido" },
];

const STATUS_LABELS = {
  PROTESTADO: "Protestado",
  PAGO: "Pago",
  DESISTENCIA: "Desistência",
  CANCELADO: "Cancelado",
  CANCELADA: "Cancelado",
  RETIRADO: "Retirado",
  DEVOLVIDO: "Devolvido",
  ESPERANDO_PROTESTO: "Aguardando Protocolo",
  "AGUARDANDO PROTESTO": "Aguardando Protocolo",
  "AGUARDANDO PROTOCOLO": "Aguardando Protocolo",
};

const STATUS_BADGE_CLASSES = {
  PROTESTADO: "bg-brand-lime/20 text-brand-lime border border-brand-lime/30",
  PAGO: "bg-brand-green/15 text-brand-green border border-brand-green/25",
  CANCELADO:
    "bg-brand-purple/20 text-brand-purple border border-brand-purple/30",
  RETIRADO: "bg-orange-100 text-orange-700 border border-orange-300",
  DEVOLVIDO: "bg-slate-200 text-slate-700 border border-slate-300",
  DESISTENCIA: "bg-pink-100 text-pink-700 border border-pink-300",
  ESPERANDO_PROTESTO: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "AGUARDANDO PROTESTO":
    "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "AGUARDANDO PROTOCOLO":
    "bg-yellow-100 text-yellow-800 border border-yellow-300",
};

const ProtestosList = () => {
  const [protestos, setProtestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProtestos, setTotalProtestos] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    statusFilter: [],
    cidade: "",
    valorMin: "",
    valorMax: "",
    dataInicio: "",
    dataFim: "",
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value || 0));

  const normalizeStatus = (status) =>
    status ? status.toString().trim().toUpperCase() : "";

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    return STATUS_LABELS[normalized] || status || "N/A";
  };

  const getStatusBadgeClass = (status) => {
    const normalized = normalizeStatus(status);
    return (
      STATUS_BADGE_CLASSES[normalized] ||
      "bg-brand-turquoise/15 text-brand-turquoise border border-brand-turquoise/25"
    );
  };

  const fetchProtestos = useCallback(async (page, search, currentFilters) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search,
        ...currentFilters,
        statusFilter:
          currentFilters.statusFilter.length > 0
            ? currentFilters.statusFilter.join(",")
            : undefined,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await protestosAPI.getAll(params);
      const { data, pages, total } = response.data;

      setProtestos(data);
      setTotalPages(pages);
      setTotalProtestos(total);
    } catch (error) {
      console.error("Erro ao buscar protestos:", error);
    } finally {
      setIsInitialLoad(false);
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((term, currentFilters) => {
        fetchProtestos(1, term, currentFilters);
        setCurrentPage(1);
      }, 500),
    [fetchProtestos]
  );

  useEffect(() => {
    fetchProtestos(currentPage, searchTerm, filters);
  }, [currentPage, fetchProtestos]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value, filters);
  };

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
    fetchProtestos(1, searchTerm, updatedFilters);
    setCurrentPage(1);
  };

  const handleStatusToggle = (statusValue) => {
    const updatedStatus = filters.statusFilter.includes(statusValue)
      ? filters.statusFilter.filter((status) => status !== statusValue)
      : [...filters.statusFilter, statusValue];

    const updatedFilters = { ...filters, statusFilter: updatedStatus };
    setFilters(updatedFilters);
    fetchProtestos(1, searchTerm, updatedFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    const emptyFilters = {
      statusFilter: [],
      cidade: "",
      valorMin: "",
      valorMax: "",
      dataInicio: "",
      dataFim: "",
    };
    setFilters(emptyFilters);
    setSearchTerm("");
    fetchProtestos(1, "", emptyFilters);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {
        search: searchTerm,
        ...filters,
        statusFilter:
          filters.statusFilter.length > 0
            ? filters.statusFilter.join(",")
            : undefined,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await protestosAPI.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `protestos_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar protestos:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este protesto? Essa ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await protestosAPI.delete(id);
      fetchProtestos(currentPage, searchTerm, filters);
    } catch (error) {
      console.error("Erro ao excluir protesto:", error);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startItem =
    totalProtestos === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem =
    totalProtestos === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, totalProtestos);

  const activeFiltersCount =
    filters.statusFilter.length +
    (filters.cidade ? 1 : 0) +
    (filters.valorMin ? 1 : 0) +
    (filters.valorMax ? 1 : 0) +
    (filters.dataInicio ? 1 : 0) +
    (filters.dataFim ? 1 : 0);

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
              <h1 className="text-2xl font-bold text-brand-deep">Protestos</h1>
              <p className="mt-1 text-sm text-slate-600">
                Gerencie protocolos ativos e finalize tratativas com agilidade
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/protestos/novo"
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
                Novo Protesto
              </Link>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-brand-turquoise bg-white px-6 py-3 text-sm font-semibold text-brand-turquoise shadow-md transition hover:bg-brand-turquoise hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {exporting ? "Exportando..." : "Exportar"}
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar por contrato, cooperado ou protocolo..."
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

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-deep bg-brand-deep px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-turquoise"
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.5V4z"
                />
              </svg>
              Filtros
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-brand-deep">
                Filtros Avançados
              </h3>
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Coluna 1: Status */}
              <div className="lg:row-span-2">
                <label className="mb-3 block text-sm font-semibold text-brand-deep">
                  📋 Filtrar por Status
                </label>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-brand-muted/60 bg-gray-50/50 p-4">
                  {STATUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={filters.statusFilter.includes(option.value)}
                        onChange={() => handleStatusToggle(option.value)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-turquoise focus:ring-brand-turquoise"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coluna 2 e 3: Valores */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-brand-deep">
                  💰 Valor Mínimo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    value={filters.valorMin}
                    onChange={(event) =>
                      handleFilterChange("valorMin", event.target.value)
                    }
                    placeholder="0,00"
                    step="0.01"
                    className="w-full rounded-xl border border-brand-muted/60 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-brand-deep">
                  💰 Valor Máximo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    value={filters.valorMax}
                    onChange={(event) =>
                      handleFilterChange("valorMax", event.target.value)
                    }
                    placeholder="0,00"
                    step="0.01"
                    className="w-full rounded-xl border border-brand-muted/60 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20"
                  />
                </div>
              </div>

              {/* Cidade */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-brand-deep">
                  🏙️ Cidade
                </label>
                <input
                  type="text"
                  value={filters.cidade}
                  onChange={(event) =>
                    handleFilterChange("cidade", event.target.value)
                  }
                  placeholder="Nome da cidade"
                  className="w-full rounded-xl border border-brand-muted/60 px-4 py-3 text-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20"
                />
              </div>

              {/* Datas */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-brand-deep">
                  📅 Data Início do Período
                </label>
                <input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(event) =>
                    handleFilterChange("dataInicio", event.target.value)
                  }
                  className="w-full rounded-xl border border-brand-muted/60 px-4 py-3 text-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-brand-deep">
                  📅 Data Fim do Período
                </label>
                <input
                  type="date"
                  value={filters.dataFim}
                  onChange={(event) =>
                    handleFilterChange("dataFim", event.target.value)
                  }
                  className="w-full rounded-xl border border-brand-muted/60 px-4 py-3 text-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/20"
                />
              </div>
            </div>

            {/* Dica de uso */}
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
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
                <div className="text-sm text-blue-700">
                  <p className="mb-1 font-semibold">
                    💡 Dica de Uso dos Filtros:
                  </p>
                  <p className="text-xs leading-relaxed">
                    <strong>Status:</strong> Selecione um ou mais status para
                    filtrar •<strong> Valores:</strong> Defina um intervalo de
                    valores •<strong> Datas:</strong> Filtre por período de
                    registro (deixe vazio para não limitar)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <span>{totalProtestos} resultado(s) encontrado(s)</span>
            </div>
          </div>
        )}

        {/* Dica de scroll em telas pequenas */}
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700 lg:hidden">
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
        <div className="overflow-hidden rounded-3xl border border-brand-muted/70 bg-white shadow-xl">
          <div className="relative">
            {loading && !isInitialLoad && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full table-auto divide-y divide-brand-muted/60 text-xs sm:text-sm">
                <thead className="bg-brand-deep text-white text-xs sm:text-sm">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Cooperado
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Contrato
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Valor
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Data Registro
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Protocolo
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide sm:px-4">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-muted/50 bg-white text-brand-deep">
                  {protestos.map((protesto) => (
                    <tr key={protesto.id} className="hover:bg-brand-muted/40">
                      <td className="px-3 py-2 font-semibold sm:px-4 whitespace-nowrap">
                        {protesto.id}
                      </td>
                      <td className="px-3 py-2 sm:px-4">
                        <div className="max-w-[10rem] sm:max-w-[12rem] lg:max-w-[16rem] text-sm font-medium text-brand-deep break-words">
                          {protesto.contrato?.cliente?.nome || "N/A"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600 sm:px-4 whitespace-nowrap">
                        {protesto.contrato?.numero_contrato_sisbr || "N/A"}
                      </td>
                      <td className="px-3 py-2 font-semibold sm:px-4 whitespace-nowrap">
                        {formatCurrency(protesto.valor_protestado)}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600 sm:px-4 whitespace-nowrap">
                        {formatDate(protesto.data_registro)}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600 sm:px-4 whitespace-nowrap">
                        {protesto.protocolo || "N/A"}
                      </td>
                      <td className="px-3 py-2 sm:px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            protesto.status
                          )}`}
                        >
                          {getStatusLabel(protesto.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm font-medium sm:px-4 whitespace-nowrap">
                        <Link
                          to={`/protestos/editar/${protesto.id}`}
                          className="mr-3 text-brand-turquoise hover:text-brand-deep"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(protesto.id)}
                          className="text-brand-purple hover:text-brand-deep"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {protestos.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-6 text-center text-slate-500"
                      >
                        Nenhum protesto localizado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-brand-muted/50 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row">
          <div>
            Mostrando{" "}
            <span className="font-semibold text-brand-deep">{startItem}</span> a{" "}
            <span className="font-semibold text-brand-deep">{endItem}</span> de{" "}
            <span className="font-semibold text-brand-deep">
              {totalProtestos}
            </span>{" "}
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
    </div>
  );
};

export default ProtestosList;
