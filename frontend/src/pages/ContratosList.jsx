// src/pages/ContratosList.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contratosAPI } from '../services/api';

const ITEMS_PER_PAGE = 10;

const ContratosList = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContratos, setTotalContratos] = useState(0);

  const fetchContratos = useCallback(async (page, search) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search,
      };

      const response = await contratosAPI.getAll(params);
      const { data, pages, total } = response.data;

      setContratos(data);
      setTotalPages(pages);
      setTotalContratos(total);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContratos(currentPage, appliedSearch);
  }, [currentPage, appliedSearch, fetchContratos]);

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedSearch(searchTerm.trim());
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await contratosAPI.delete(id);
        fetchContratos(currentPage, appliedSearch);
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
      }
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startItem = totalContratos === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = totalContratos === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, totalContratos);

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
          <h1 className="text-2xl font-semibold text-brand-deep">Contratos</h1>
          <p className="text-sm text-slate-500">Controle a carteira contratual e acompanhe a performance por especie.</p>
        </div>
        <Link
          to="/contratos/novo"
          className="inline-flex items-center rounded-full bg-brand-turquoise px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-deep"
        >
          Adicionar contrato
        </Link>
      </div>

      <form onSubmit={handleSearch} className="rounded-3xl border border-brand-muted/60 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por numero ou cliente"
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
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Contrato SISBR</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Cliente</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Especie</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Ponto atendimento</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-muted/50 bg-white text-brand-deep">
            {contratos.map((contrato) => (
              <tr key={contrato.id} className="hover:bg-brand-muted/40">
                <td className="whitespace-nowrap px-6 py-4 font-semibold">{contrato.id}</td>
                <td className="whitespace-nowrap px-6 py-4">{contrato.numero_contrato_sisbr}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{contrato.cliente?.nome || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full border border-brand-purple/30 bg-brand-purple/15 px-3 py-1 text-xs font-semibold text-brand-purple">
                    {contrato.especie || ' - '}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{contrato.ponto_atendimento}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <Link
                    to={`/contratos/editar/${contrato.id}`}
                    className="mr-4 text-brand-turquoise hover:text-brand-deep"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(contrato.id)}
                    className="text-brand-purple hover:text-brand-deep"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {contratos.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-6 text-center text-slate-500">
                  Nenhum contrato localizado.
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
          <span className="font-semibold text-brand-deep">{totalContratos}</span> resultados
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

export default ContratosList;
