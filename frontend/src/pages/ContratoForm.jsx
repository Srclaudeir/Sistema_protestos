// src/pages/ContratoForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contratosAPI, clientesAPI } from '../services/api';

const especies = [
  'CARTAO',
  'VEICULO',
  'PRONAMPE',
  'BNDES',
  'CAPITAL DE GIRO',
  'CHEQUE ESPECIAL',
  'ANTECIPACAO',
  'FINANCIAMENTO',
  'PRONAMP',
];

const ContratoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    numero_contrato_sisbr: '',
    numero_contrato_legado: '',
    especie: '',
    ponto_atendimento: '',
    cliente_id: '',
  });
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await clientesAPI.getAll({ limit: 200 });
        setClientes(response.data.data ?? []);
      } catch (err) {
        console.error(err);
        setError('Nao foi possivel carregar a lista de clientes.');
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchContrato = async () => {
      try {
        setLoading(true);
        const response = await contratosAPI.getById(id);
        const data = response.data.data;
        setFormData({
          numero_contrato_sisbr: data.numero_contrato_sisbr ?? '',
          numero_contrato_legado: data.numero_contrato_legado ?? '',
          especie: data.especie ?? '',
          ponto_atendimento: data.ponto_atendimento ?? '',
          cliente_id: data.cliente_id ?? '',
        });
      } catch (err) {
        console.error(err);
        setError('Nao foi possivel carregar os dados do contrato.');
      } finally {
        setLoading(false);
      }
    };

    fetchContrato();
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
        await contratosAPI.update(id, formData);
      } else {
        await contratosAPI.create(formData);
      }
      navigate('/contratos');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao salvar contrato.');
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
        <p className="text-xs uppercase tracking-[0.32em] text-white/70">Contratos</p>
        <h1 className="mt-2 text-3xl font-semibold">
          {id ? 'Atualizar contrato' : 'Cadastrar novo contrato'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          Identifique o contrato no SISBR, selecione o cliente vinculado e ajuste os dados complementares.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-brand-muted/60 bg-white/95 p-8 shadow-xl">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="numero_contrato_sisbr" className={labelClass}>
                Numero do contrato SISBR *
              </label>
              <input
                id="numero_contrato_sisbr"
                name="numero_contrato_sisbr"
                type="text"
                value={formData.numero_contrato_sisbr}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="numero_contrato_legado" className={labelClass}>
                Numero do contrato legado
              </label>
              <input
                id="numero_contrato_legado"
                name="numero_contrato_legado"
                type="text"
                value={formData.numero_contrato_legado}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="especie" className={labelClass}>
                Especie
              </label>
              <select
                id="especie"
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Selecione...</option>
                {especies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ponto_atendimento" className={labelClass}>
                Ponto de atendimento
              </label>
              <input
                id="ponto_atendimento"
                name="ponto_atendimento"
                type="text"
                value={formData.ponto_atendimento}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="cliente_id" className={labelClass}>
              Cliente vinculado *
            </label>
            <select
              id="cliente_id"
              name="cliente_id"
              value={formData.cliente_id}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Selecione um cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} {cliente.cpf_cnpj ? `(${cliente.cpf_cnpj})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand-muted/40 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/contratos')}
              className="inline-flex items-center justify-center rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Salvando...' : 'Salvar contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContratoForm;
