// src/pages/ClientesList.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientesAPI } from '../services/api';

const ITEMS_PER_PAGE = 10;

const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);

  const fetchClientes = useCallback(async (page, search) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search,
      };

      const response = await clientesAPI.getAll(params);
      const { data, pages, total } = response.data;

      setClientes(data);
      setTotalPages(pages);
      setTotalClientes(total);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes(currentPage, appliedSearch);
  }, [currentPage, appliedSearch, fetchClientes]);

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedSearch(searchTerm.trim());
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await clientesAPI.delete(id);
        fetchClientes(currentPage, appliedSearch);
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startItem = totalClientes === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = totalClientes === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, totalClientes);

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
          <h1 className="text-2xl font-semibold text-brand-deep">Clientes</h1>
          <p className="text-sm text-slate-500">Controle da base cadastral com indicadores de relacionamento.</p>
        </div>
        <Link
          to="/clientes/novo"
          className="inline-flex items-center rounded-full bg-brand-turquoise px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-deep"
        >
          Adicionar cliente
        </Link>
      </div>

      <form onSubmit={handleSearch} className="rounded-3xl border border-brand-muted/60 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nome ou CPF/CNPJ"
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
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Nome</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">CPF/CNPJ</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Tipo</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Cidade</th>
              <th className="px-6 py-3 text-left font-semibold uppercase tracking-wide">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-muted/50 bg-white text-brand-deep">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-brand-muted/40">
                <td className="whitespace-nowrap px-6 py-4 font-semibold">{cliente.id}</td>
                <td className="whitespace-nowrap px-6 py-4">{cliente.nome}</td>
                <td className="whitespace-nowrap px-6 py-4">{cliente.cpf_cnpj}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      cliente.tipo_conta === 'PF'
                        ? 'bg-brand-turquoise/15 text-brand-turquoise border border-brand-turquoise/30'
                        : 'bg-brand-green/15 text-brand-green border border-brand-green/30'
                    }`}
                  >
                    {cliente.tipo_conta}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{cliente.cidade}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <Link
                    to={`/clientes/editar/${cliente.id}`}
                    className="mr-4 text-brand-turquoise hover:text-brand-deep"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(cliente.id)}
                    className="text-brand-purple hover:text-brand-deep"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-6 text-center text-slate-500">
                  Nenhum cliente localizado.
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
          <span className="font-semibold text-brand-deep">{totalClientes}</span> resultados
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

export default ClientesList;
