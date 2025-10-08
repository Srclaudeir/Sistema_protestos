// src/pages/ClienteForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientesAPI } from '../services/api';

const ClienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    tipo_conta: 'PF',
    cidade: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchCliente = async () => {
      try {
        setLoading(true);
        const response = await clientesAPI.getById(id);
        setFormData({
          nome: response.data.data.nome ?? '',
          cpf_cnpj: response.data.data.cpf_cnpj ?? '',
          tipo_conta: response.data.data.tipo_conta ?? 'PF',
          cidade: response.data.data.cidade ?? '',
        });
      } catch (err) {
        console.error(err);
        setError('Nao foi possivel carregar os dados do cliente.');
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
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
        await clientesAPI.update(id, formData);
      } else {
        await clientesAPI.create(formData);
      }
      navigate('/clientes');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao salvar cliente.');
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
        <p className="text-xs uppercase tracking-[0.32em] text-white/70">Clientes</p>
        <h1 className="mt-2 text-3xl font-semibold">
          {id ? 'Atualizar cadastro do cliente' : 'Cadastrar novo cliente'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          Preencha as informacoes cadastrais, vinculando o cliente aos protestos e contratos vigentes.
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="tipo_conta" className={labelClass}>
                Tipo de conta *
              </label>
              <select
                id="tipo_conta"
                name="tipo_conta"
                value={formData.tipo_conta}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="PF">Pessoa Fisica (PF)</option>
                <option value="PJ">Pessoa Juridica (PJ)</option>
              </select>
            </div>

            <div>
              <label htmlFor="cidade" className={labelClass}>
                Cidade
              </label>
              <input
                id="cidade"
                name="cidade"
                type="text"
                value={formData.cidade}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

            <div className="flex flex-col gap-3 border-t border-brand-muted/40 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/clientes')}
                className="inline-flex items-center justify-center rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Salvando...' : 'Salvar cliente'}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;
