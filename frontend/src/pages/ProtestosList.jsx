// src/pages/ProtestosList.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { protestosAPI } from '../services/api';

const ITEMS_PER_PAGE = 10;

const ProtestosList = () => {
  const [protestos, setProtestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProtestos, setTotalProtestos] = useState(0);

  const fetchProtestos = useCallback(async (page, search) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search,
      };

      const response = await protestosAPI.getAll(params);
      const { data, pages, total } = response.data;

      setProtestos(data);
      setTotalPages(pages);
      setTotalProtestos(total);
    } catch (error) {
      console.error('Erro ao buscar protestos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProtestos(currentPage, appliedSearch);
  }, [currentPage, appliedSearch, fetchProtestos]);

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedSearch(searchTerm.trim());
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este protesto?')) {
      try {
        await protestosAPI.delete(id);
        fetchProtestos(currentPage, appliedSearch);
      } catch (error) {
        console.error('Erro ao excluir protesto:', error);
      }
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDate = (value) => {
    if (!value) {
      return 'N/A';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('pt-BR');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PROTESTADO':
        return 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30';
      case 'PAGO':
        return 'bg-brand-green/15 text-brand-green border border-brand-green/25';
      case 'CANCELADO':
        return 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30';
      default:
        return 'bg-brand-turquoise/15 text-brand-turquoise border border-brand-turquoise/25';
    }
  };

  const startItem = totalProtestos === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = totalProtestos === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, totalProtestos);

  if (loading) {
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
          <h1 className="text-2xl font-semibold text-brand-deep">Protestos</h1>
          <p className="text-sm text-slate-500">Supervisione protocolos ativos e finalize tratativas com agilidade.</p>
        </div>
        <Link
          to="/protestos/novo"
          className="inline-flex items-center rounded-full bg-brand-turquoise px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-deep"
        >
          Adicionar protesto
        </Link>
      </div>

      <form onSubmit={handleSearch} className="rounded-3xl border border-brand-muted/60 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por contrato, cliente ou protocolo"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="flex-1 rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-purple"
          >
            Buscar
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-brand-muted/70 bg-white shadow-xl">
        <table className="min-w-full divide-y divide-brand-muted/60 text-sm">
          <thead className="bg-brand-deep text-white">
            <tr>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">ID</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Cliente</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Contrato</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Valor</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Data registro</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Protocolo</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-muted/50 bg-white text-brand-deep">
            {protestos.map((protesto) => (
              <tr key={protesto.id} className="hover:bg-brand-muted/40">
                <td className="whitespace-nowrap px-6 py-4 font-semibold">{protesto.id}</td>
                <td className="whitespace-nowrap px-6 py-4">{protesto.contrato?.cliente?.nome || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{protesto.contrato?.numero_contrato_sisbr || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4 font-semibold">{formatCurrency(protesto.valor_protestado)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{formatDate(protesto.data_registro)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{protesto.protocolo || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(protesto.status)}`}>
                    {protesto.status || 'N/A'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <Link
                    to={`/protestos/editar/${protesto.id}`}
                    className="mr-4 text-brand-turquoise hover:text-brand-deep"
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
                <td colSpan="8" className="px-6 py-6 text-center text-slate-500">
                  Nenhum protesto localizado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-brand-muted/50 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div>
          Mostrando <span className="font-semibold text-brand-deep">{startItem}</span> a{' '}
          <span className="font-semibold text-brand-deep">{endItem}</span> de{' '}
          <span className="font-semibold text-brand-deep">{totalProtestos}</span> resultados
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              currentPage === 1
                ? 'cursor-not-allowed bg-brand-muted text-slate-400'
                : 'bg-brand-turquoise/15 text-brand-turquoise hover:bg-brand-turquoise hover:text-white'
            }`}
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                currentPage === page
                  ? 'bg-brand-deep text-white'
                  : 'bg-brand-muted text-brand-deep hover:bg-brand-turquoise hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              currentPage === totalPages
                ? 'cursor-not-allowed bg-brand-muted text-slate-400'
                : 'bg-brand-turquoise/15 text-brand-turquoise hover:bg-brand-turquoise hover:text-white'
            }`}
          >
            Proxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtestosList;
