// src/pages/AvalistaForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { avalistasAPI, protestosAPI } from '../services/api';

const AvalistaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    protesto_id: '',
  });
  const [protestos, setProtestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProtestos = async () => {
      try {
        const response = await protestosAPI.getAll({ limit: 200 });
        setProtestos(response.data.data ?? []);
      } catch (err) {
        console.error(err);
        setError('Nao foi possivel carregar a lista de protestos.');
      }
    };

    fetchProtestos();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchAvalista = async () => {
      try {
        setLoading(true);
        const response = await avalistasAPI.getById(id);
        const data = response.data.data;
        setFormData({
          nome: data.nome ?? '',
          cpf_cnpj: data.cpf_cnpj ?? '',
          protesto_id: data.protesto_id ?? '',
        });
      } catch (err) {
        console.error(err);
        setError('Nao foi possivel carregar os dados do avalista.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvalista();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (id) {
        await avalistasAPI.update(id, formData);
      } else {
        await avalistasAPI.create(formData);
      }
      navigate('/avalistas');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao salvar avalista.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-turquoise border-t-transparent" />
      </div>
    );
  }

  const labelClass = 'mb-1 block text-sm font-semibold text-brand-deep/80';
  const inputClass = 'w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-brand-navy via-brand-turquoise-dark to-brand-green px-8 py-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.32em] text-white/70">Avalistas</p>
        <h1 className="mt-2 text-3xl font-semibold">
          {id ? 'Atualizar avalista' : 'Cadastrar novo avalista'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          Relacione o avalista ao protesto correspondente e mantenha os dados de contato organizados para tratativas.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-brand-muted/60 bg-white/95 p-8 shadow-xl">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className={labelClass}>
                Nome completo *
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="cpf_cnpj" className={labelClass}>
                CPF/CNPJ
              </label>
              <input
                id="cpf_cnpj"
                name="cpf_cnpj"
                type="text"
                value={formData.cpf_cnpj}
                onChange={handleChange}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="protesto_id" className={labelClass}>
              Protesto associado
            </label>
            <select
              id="protesto_id"
              name="protesto_id"
              value={formData.protesto_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Selecione um protesto...</option>
              {protestos.map((protesto) => (
                <option key={protesto.id} value={protesto.id}>
                  {protesto.protocolo || `Protesto ${protesto.id}`} - {protesto.contrato?.cliente?.nome || 'Cliente nao informado'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand-muted/40 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/avalistas')}
              className="inline-flex items-center justify-center rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Salvando...' : 'Salvar avalista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvalistaForm;
