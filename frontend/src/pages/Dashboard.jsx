// src/pages/Dashboard.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { dashboardAPI } from "../services/api";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatDate } from "../utils/dateFormatter";

// Paleta de cores melhorada para melhor contraste e acessibilidade
const COLORS = [
  "#00AE9D", // brand-turquoise
  "#5E9F1A", // brand-green
  "#F97316", // brand-orange
  "#EC4899", // brand-pink
  "#49479D", // brand-purple
  "#475569", // brand-slate
  "#C9D200", // brand-lime
  "#EF4444", // vermelho
  "#F59E0B", // amarelo
  "#6366F1", // índigo
];

const STATUS_FILTER_OPTIONS = [
  { value: "TODOS", label: "Todos os status" },
  { value: "AGUARDADANDO PROTESTO", label: "Aguardando Protocolo" },
  { value: "PROTESTADO", label: "Protestado" },
  { value: "PAGO", label: "Pago" },
  { value: "DESISTENCIA", label: "Desistência" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "RETIRADO", label: "Retirado" },
  { value: "DEVOLVIDO", label: "Devolvido" },
];

const normalizeStatus = (status) =>
  status ? status.toString().trim().toUpperCase() : "SEM_STATUS";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalContratos: 0,
    protestosAtivos: 0,
    valorTotal: 0,
    totalAvalistas: 0,
    protestosPagos: 0,
    ticketMedio: 0,
    maiorProtesto: 0,
  });
  const [detailedStats, setDetailedStats] = useState({
    protestosPorStatus: [],
    protestosPorCidade: [],
    evolucaoMensal: [],
    maioresProtestos: [],
  });
  const [latestProtestos, setLatestProtestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("TODOS");

  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryResponse, detailsResponse] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getDetailedStats(),
      ]);

      if (!summaryResponse.data?.success || !summaryResponse.data?.data) {
        throw new Error(
          summaryResponse.data?.message || "Erro ao carregar estatísticas"
        );
      }

      const summary = summaryResponse.data.data;
      setStats({
        totalClientes: summary.totalClientes ?? 0,
        totalContratos: summary.totalContratos ?? 0,
        protestosAtivos: summary.protestosAtivos ?? 0,
        valorTotal: summary.valorTotalProtestos ?? 0,
        totalAvalistas: summary.totalAvalistas ?? 0,
        protestosPagos: summary.protestosPagos ?? 0,
        ticketMedio: summary.ticketMedio ?? 0,
        maiorProtesto: summary.maiorProtesto ?? 0,
      });
      setLatestProtestos(summary.latestProtestos ?? []);

      if (detailsResponse.data?.success && detailsResponse.data?.data) {
        setDetailedStats(detailsResponse.data.data);
      }

      setError(null);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError("Não foi possível carregar os dados do dashboard.");
    }
  }, []);

  useEffect(() => {
    let intervalId;

    const initialize = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);

      intervalId = window.setInterval(fetchDashboardData, 60_000);
    };

    initialize();

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [fetchDashboardData]);

  const formatNumber = (value) => Number(value || 0).toLocaleString("pt-BR");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value || 0));

  const formatContrato = (contrato) => {
    if (!contrato) return " - ";
    return (
      contrato.numero_contrato_sisbr || contrato.numero_contrato_legado || " - "
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PROTESTADO":
        return "bg-brand-lime/20 text-brand-lime border border-brand-lime/30";
      case "PAGO":
        return "bg-brand-green/15 text-brand-green border border-brand-green/25";
      case "CANCELADO":
        return "bg-brand-purple/15 text-brand-purple border border-brand-purple/25";
      default:
        return "bg-brand-turquoise/15 text-brand-turquoise border border-brand-turquoise/25";
    }
  };

  const selectedStatusOption = useMemo(
    () =>
      STATUS_FILTER_OPTIONS.find(
        (option) => option.value === selectedStatusFilter
      ) ?? STATUS_FILTER_OPTIONS[0],
    [selectedStatusFilter]
  );

  const protestosPorStatusMap = useMemo(() => {
    const map = new Map();
    let totalQuantidade = 0;
    let totalValor = 0;

    detailedStats.protestosPorStatus.forEach((item) => {
      const key = normalizeStatus(item.status);
      const quantidade = Number(
        item.quantidade ?? item?.dataValues?.quantidade ?? 0
      );
      const valor = Number(
        item.valor_total ?? item?.dataValues?.valor_total ?? 0
      );

      map.set(key, { quantidade, valor });
      totalQuantidade += quantidade;
      totalValor += valor;
    });

    map.set("TOTAL", { quantidade: totalQuantidade, valor: totalValor });
    return map;
  }, [detailedStats.protestosPorStatus]);

  const filteredProtestoMetrics = useMemo(() => {
    const key =
      selectedStatusFilter === "TODOS"
        ? "TOTAL"
        : normalizeStatus(selectedStatusFilter);

    const base = protestosPorStatusMap.get(key) || {
      quantidade: 0,
      valor: 0,
    };

    const quantidade = Number(base.quantidade || 0);
    const valor = Number(base.valor || 0);
    const ticket = quantidade > 0 ? valor / quantidade : 0;

    const maior =
      detailedStats.maioresProtestos?.reduce((max, item) => {
        if (
          selectedStatusFilter !== "TODOS" &&
          normalizeStatus(item.status) !== key
        ) {
          return max;
        }

        const valorItem = Number(item.valor_protestado || 0);
        return valorItem > max ? valorItem : max;
      }, 0) ?? 0;

    return {
      quantidade,
      valor,
      ticket,
      maior,
    };
  }, [
    selectedStatusFilter,
    detailedStats.maioresProtestos,
    protestosPorStatusMap,
  ]);

  const highlightCards = useMemo(() => {
    const statusLabel =
      selectedStatusFilter === "TODOS"
        ? "Dados agregados de todos os status"
        : `Status: ${selectedStatusOption.label}`;

    return [
      {
        title: "Carteira ativa",
        value: formatNumber(stats.totalClientes),
        subtitle: "Total de cooperados",
        className: "from-brand-turquoise to-brand-green",
      },
      {
        title: "Instrumentos gerenciados",
        value: formatNumber(stats.totalContratos),
        subtitle: "Total de contratos",
        className: "from-brand-purple to-brand-pink",
      },
      {
        title: "Garantias registradas",
        value: formatNumber(stats.totalAvalistas),
        subtitle: "Total de avalistas",
        className: "from-brand-navy to-brand-deep",
      },
      {
        title: "Baixados no sistema",
        value: formatNumber(stats.protestosPagos),
        subtitle: "Protestos pagos",
        className: "from-brand-lime to-brand-green",
      },
      {
        title: "Valor em aberto",
        value: formatCurrency(filteredProtestoMetrics.valor),
        subtitle: statusLabel,
        className: "from-orange-600 to-pink-600",
      },
      {
        title: "Quantidade de protestos",
        value: formatNumber(filteredProtestoMetrics.quantidade),
        subtitle: statusLabel,
        className: "from-slate-700 to-slate-900",
      },
      {
        title: "Ticket médio",
        value: formatCurrency(filteredProtestoMetrics.ticket),
        subtitle: statusLabel,
        className: "from-brand-green to-brand-turquoise",
      },
      {
        title: "Maior protesto",
        value: formatCurrency(filteredProtestoMetrics.maior),
        subtitle:
          filteredProtestoMetrics.maior > 0
            ? statusLabel
            : "Sem registros para o filtro",
        className: "from-pink-600 to-orange-600",
      },
    ];
  }, [
    filteredProtestoMetrics,
    selectedStatusFilter,
    selectedStatusOption,
    stats,
  ]);

  const filteredMaioresProtestos = useMemo(() => {
    if (selectedStatusFilter === "TODOS") {
      return detailedStats.maioresProtestos;
    }
    const target = normalizeStatus(selectedStatusFilter);
    return detailedStats.maioresProtestos.filter(
      (item) => normalizeStatus(item.status) === target
    );
  }, [detailedStats.maioresProtestos, selectedStatusFilter]);

  const filteredLatestProtestos = useMemo(() => {
    if (selectedStatusFilter === "TODOS") {
      return latestProtestos;
    }
    const target = normalizeStatus(selectedStatusFilter);
    return latestProtestos.filter(
      (item) => normalizeStatus(item.status) === target
    );
  }, [latestProtestos, selectedStatusFilter]);

  // Dados filtrados apenas para o gráfico de protestos por status
  const filteredProtestosPorStatus = useMemo(() => {
    if (selectedStatusFilter === "TODOS") {
      return detailedStats.protestosPorStatus;
    }

    // Quando um status específico é selecionado, mostra apenas esse status
    // mas com o percentual correto em relação ao total
    const target = normalizeStatus(selectedStatusFilter);
    const selectedItem = detailedStats.protestosPorStatus.find(
      (item) => normalizeStatus(item.status) === target
    );

    if (selectedItem) {
      return [selectedItem];
    }

    return [];
  }, [detailedStats.protestosPorStatus, selectedStatusFilter]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-3xl border border-brand-muted/70 bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-brand-deep">
              Visão geral consolidada
            </h1>
            <p className="text-sm text-slate-600">
              Acompanhe em tempo real a performance do ciclo de protestos,
              cooperados e contratos. Utilize o filtro para analisar um status
              específico.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="text-sm font-semibold text-brand-deep">
              Status dos protestos
            </label>
            <div className="relative">
              <select
                value={selectedStatusFilter}
                onChange={(event) =>
                  setSelectedStatusFilter(event.target.value)
                }
                className="appearance-none rounded-xl border border-brand-muted bg-white px-4 py-2.5 pr-10 text-sm font-medium text-brand-deep shadow-sm outline-none transition-all duration-200 hover:border-brand-turquoise/60 focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-brand-deep/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlightCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-2xl bg-gradient-to-br ${card.className} p-4 text-white shadow-lg min-h-[140px] flex flex-col justify-between`}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/70 truncate">
                {card.subtitle}
              </p>
              <h3 className="mt-2 text-base font-semibold line-clamp-2">
                {card.title}
              </h3>
              <p className="mt-3 text-2xl font-bold truncate">{card.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-deep">
            Top 3 cidades
          </h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={detailedStats.protestosPorCidade.slice(0, 3)}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="cidade"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                  tickFormatter={(value) =>
                    `R$ ${(value / 1000000).toFixed(1)}M`
                  }
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "quantidade") {
                      return [formatNumber(value), "Quantidade"];
                    }
                    if (name === "valor_total") {
                      return [formatCurrency(value), "Valor total"];
                    }
                    return formatCurrency(value);
                  }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                />
                <Bar
                  dataKey="valor_total"
                  fill="#00AE9D"
                  name="Valor total"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-deep">
              Protestos por status
            </h2>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredProtestosPorStatus}
                  dataKey="quantidade"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {filteredProtestosPorStatus.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const total = filteredProtestosPorStatus.reduce(
                      (sum, item) => sum + item.quantidade,
                      0
                    );
                    const percent =
                      total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return [
                      <div key="tooltip">
                        <div className="font-semibold text-gray-800">
                          {props.payload.status}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatNumber(value)} protestos ({percent}%)
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(props.payload.valor_total || 0)}
                        </div>
                      </div>,
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    padding: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  height={60}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-1">
        <div className="rounded-3xl border border-brand-muted/60 bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-deep">
            Evolução mensal dos protestos
          </h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={detailedStats.evolucaoMensal}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                  tickFormatter={(value) =>
                    `R$ ${(value / 1000000).toFixed(1)}M`
                  }
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "valor_total") {
                      return [formatCurrency(value), "Valor total"];
                    }
                    if (name === "quantidade") {
                      return [formatNumber(value), "Quantidade"];
                    }
                    return formatCurrency(value);
                  }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="valor_total"
                  stroke="#00AE9D"
                  strokeWidth={3}
                  name="Valor total"
                  dot={{ fill: "#00AE9D", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#00AE9D", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="quantidade"
                  stroke="#5E9F1A"
                  strokeWidth={3}
                  name="Quantidade"
                  dot={{ fill: "#5E9F1A", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#5E9F1A", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-brand-muted/60 bg-white shadow-xl overflow-hidden">
        <header className="flex flex-col gap-2 border-b border-brand-muted/50 px-4 lg:px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-brand-deep">
              Maiores protestos
            </h2>
            <p className="text-xs lg:text-sm text-slate-600">
              Análise dos maiores valores registrados. Filtro aplicado:{" "}
              <strong className="text-slate-700">
                {selectedStatusOption.label.toLowerCase()}
              </strong>
              .
            </p>
          </div>
        </header>
        <div className="overflow-hidden">
          <table className="w-full table-auto divide-y divide-brand-muted/60 text-xs sm:text-sm">
            <thead className="bg-brand-navy text-white text-xs sm:text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Cooperado
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Contrato
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Protocolo
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Valor
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/60 bg-white">
              {filteredMaioresProtestos.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-6 text-center text-slate-600"
                  >
                    Nenhum protesto encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
              {filteredMaioresProtestos.map((protesto) => (
                <tr key={protesto.id} className="hover:bg-brand-muted/40">
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap font-medium text-brand-deep">
                    {protesto.cliente_nome}
                  </td>
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap text-slate-600">
                    {protesto.numero_contrato}
                  </td>
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap text-slate-600">
                    {protesto.protocolo}
                  </td>
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap font-semibold text-brand-deep">
                    {formatCurrency(protesto.valor_protestado)}
                  </td>
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        protesto.status
                      )}`}
                    >
                      {protesto.status || " - "}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-brand-muted/60 bg-white shadow-xl overflow-hidden">
        <header className="flex flex-col gap-2 border-b border-brand-muted/50 px-4 lg:px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-brand-deep">
              Últimos protestos registrados
            </h2>
            <p className="text-xs lg:text-sm text-slate-600">
              Monitoramento dos novos registros. Filtro aplicado:{" "}
              <strong className="text-slate-700">
                {selectedStatusOption.label.toLowerCase()}
              </strong>
              .
            </p>
          </div>
        </header>
        <div className="overflow-hidden">
          <table className="w-full table-auto divide-y divide-brand-muted/60 text-xs sm:text-sm">
            <thead className="bg-brand-navy text-white text-xs sm:text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Cooperado
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Contrato
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Valor
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide sm:px-6">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/60 bg-white">
              {filteredLatestProtestos.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-6 text-center text-slate-600"
                  >
                    Nenhum protesto encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
              {filteredLatestProtestos.map((protesto) => (
                <tr key={protesto.id} className="hover:bg-brand-muted/40">
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap font-medium text-brand-deep">
                    {protesto.cliente?.nome || " - "}
                  </td>
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap text-slate-600">
                    {formatContrato(protesto.contrato)}
                  </td>
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap font-semibold text-brand-deep">
                    {formatCurrency(protesto.valor_protestado)}
                  </td>
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        protesto.status
                      )}`}
                    >
                      {protesto.status || " - "}
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-6 md:whitespace-nowrap text-slate-600">
                    {formatDate(protesto.data_registro, " - ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
