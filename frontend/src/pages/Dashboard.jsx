// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalContratos: 0,
    protestosAtivos: 0,
    valorTotal: 0,
  });
  const [latestProtestos, setLatestProtestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getSummary();
        if (!response.data?.success || !response.data?.data) {
          throw new Error(response.data?.message || 'Falha ao carregar estatisticas');
        }

        const summary = response.data.data;
        setStats({
          totalClientes: summary.totalClientes ?? 0,
          totalContratos: summary.totalContratos ?? 0,
          protestosAtivos: summary.protestosAtivos ?? 0,
          valorTotal: summary.valorTotalProtestos ?? 0,
        });
        setLatestProtestos(summary.latestProtestos ?? []);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Nao foi possivel carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatNumber = (value) => Number(value || 0).toLocaleString('pt-BR');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) return ' - ';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ' - '
      : date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatContrato = (contrato) => {
    if (!contrato) return ' - ';
    return contrato.numero_contrato_sisbr || contrato.numero_contrato_legado || ' - ';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PROTESTADO':
        return 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30';
      case 'PAGO':
        return 'bg-brand-green/15 text-brand-green border border-brand-green/25';
      case 'CANCELADO':
        return 'bg-brand-purple/15 text-brand-purple border border-brand-purple/25';
      default:
        return 'bg-brand-turquoise/15 text-brand-turquoise border border-brand-turquoise/25';
    }
  };

  const highlightCards = useMemo(() => [
    {
      title: 'Total de Clientes',
      value: formatNumber(stats.totalClientes),
      subtitle: 'Carteira ativa',
      className: 'from-brand-turquoise to-brand-green',
    },
    {
      title: 'Total de Contratos',
      value: formatNumber(stats.totalContratos),
      subtitle: 'Instrumentos gerenciados',
      className: 'from-brand-purple to-brand-turquoise',
    },
    {
      title: 'Protestos Ativos',
      value: formatNumber(stats.protestosAtivos),
      subtitle: 'Pendentes de solucao',
      className: 'from-brand-deep to-brand-purple',
    },
    {
      title: 'Valor Total',
      value: formatCurrency(stats.valorTotal),
      subtitle: 'Montante em aberto',
      className: 'from-brand-lime to-brand-green text-brand-deep',
      darkText: true,
    },
  ], [stats]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-turquoise-dark to-brand-green px-8 py-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Visao geral consolidada</h1>
            <p className="mt-3 max-w-xl text-sm text-white/80">
              Acompanhe em tempo real a performance do ciclo de protestos, clientes e contratos. Os indicadores abaixo
              destacam o volume atual da base e o montante financeiro comprometido.
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-6 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Valor em aberto</p>
            <p className="text-3xl font-bold">{formatCurrency(stats.valorTotal)}</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-6 py-4 text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {highlightCards.map((card) => {
          const isLightTone = card.tone === 'light';
          return (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 shadow-brand-card ${isLightTone ? 'text-white' : 'text-brand-deep'}`}
            >
              <div className="flex flex-col gap-3">
                <p className={`text-xs uppercase tracking-[0.3em] ${isLightTone ? 'text-white/70' : 'text-brand-deep/70'}`}>
                  {card.subtitle}
                </p>
                <h3 className={`text-2xl font-semibold ${isLightTone ? 'text-white' : 'text-brand-deep'}`}>
                  {card.value}
                </h3>
                <p className={`text-sm font-medium ${isLightTone ? 'text-white/80' : 'text-brand-deep/80'}`}>
                  {card.title}
                </p>
              </div>
              <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full ${isLightTone ? 'bg-white/10' : 'bg-brand-overlay/60'}`} />
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-brand-muted/60 bg-white shadow-xl">
        <header className="flex flex-col gap-2 border-b border-brand-muted/50 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-brand-deep">Ultimos protestos registrados</h2>
            <p className="text-sm text-slate-500">
              Monitore os casos mais recentes para agilizar tratativas e reduzir riscos financeiros.
            </p>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-muted/60 text-sm">
            <thead className="bg-brand-navy text-white">
              <tr>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Cliente</th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Contrato</th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Valor</th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/60 bg-white">
              {latestProtestos.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-slate-500">
                    Nenhum protesto encontrado.
                  </td>
                </tr>
              )}
              {latestProtestos.map((protesto) => (
                <tr key={protesto.id} className="hover:bg-brand-muted/40">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-brand-deep">
                    {protesto.cliente?.nome || ' - '}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {formatContrato(protesto.contrato)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-brand-deep">
                    {formatCurrency(protesto.valor_protestado)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(protesto.status)}`}>
                      {protesto.status || ' - '}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {formatDate(protesto.data_registro)}
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


