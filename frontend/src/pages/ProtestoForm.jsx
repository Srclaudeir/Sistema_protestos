// src/pages/ProtestoForm.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { protestosAPI, contratosAPI } from "../services/api";

const statusOptions = [
  "ESPERANDO_PROTESTO",
  "CONFIRMADO",
  "SUSTADO",
  "PROTESTADO",
  "PAGO",
  "PAGO_COOPERATIVA",
  "ACORDO",
  "RENEGOCIADO",
  "DESISTENCIA",
  "ANUENCIA",
  "LIQUIDADO",
  "CANCELADO",
  "JUDICIAL",
];

const ProtestoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    valor_protestado: "",
    numero_parcela: "",
    data_registro: "",
    protocolo: "",
    status: "ESPERANDO_PROTESTO",
    situacao: "",
    data_baixa_cartorio: "",
    contrato_id: "",
  });
  const [contratos, setContratos] = useState([]);
  const [contratosLoading, setContratosLoading] = useState(false);
  const [contratosError, setContratosError] = useState("");
  const [contratoSearchTerm, setContratoSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mergeContratos = useCallback((lista) => {
    const map = new Map();
    lista.forEach((contrato) => {
      if (!map.has(contrato.id)) {
        map.set(contrato.id, contrato);
      }
    });
    setContratos(Array.from(map.values()));
  }, []);

  const fetchContratos = useCallback(
    async (searchValue = "", selectedContratoId = null) => {
      try {
        setContratosLoading(true);
        setContratosError("");

        const params = {
          limit: 50,
        };

        if (searchValue) {
          params.search = searchValue;
        }

        const response = await contratosAPI.getAll(params);
        const listaBase = response.data?.data ?? [];
        const contratosAtualizados = [...listaBase];

        if (
          selectedContratoId &&
          !listaBase.some((contrato) => contrato.id === selectedContratoId)
        ) {
          try {
            const contratoIndividual = await contratosAPI.getById(
              selectedContratoId
            );
            if (contratoIndividual.data?.data) {
              contratosAtualizados.push(contratoIndividual.data.data);
            }
          } catch (innerError) {
            console.error("Erro ao carregar contrato selecionado:", innerError);
          }
        }

        mergeContratos(contratosAtualizados);
      } catch (err) {
        console.error(err);
        setContratosError(
          "Não foi possível carregar a lista de contratos. Tente novamente."
        );
      } finally {
        setContratosLoading(false);
      }
    },
    [mergeContratos]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchContratos(contratoSearchTerm, formData.contrato_id);
    }, 400);

    return () => clearTimeout(handler);
  }, [contratoSearchTerm, formData.contrato_id, fetchContratos]);

  useEffect(() => {
    if (!id) return;

    const fetchProtesto = async () => {
      try {
        setLoading(true);
        const response = await protestosAPI.getById(id);
        const data = response.data.data;
        setFormData({
          valor_protestado: data.valor_protestado ?? "",
          numero_parcela: data.numero_parcela ?? "",
          data_registro: data.data_registro ?? "",
          protocolo: data.protocolo ?? "",
          status: data.status ?? "ESPERANDO_PROTESTO",
          situacao: data.situacao ?? "",
          data_baixa_cartorio: data.data_baixa_cartorio ?? "",
          contrato_id: data.contrato_id ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("Nao foi possivel carregar os dados do protesto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProtesto();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("📤 Enviando protesto com dados:", formData);
      if (id) {
        const response = await protestosAPI.update(id, formData);
        console.log("✅ Protesto atualizado:", response.data);
      } else {
        const response = await protestosAPI.create(formData);
        console.log("✅ Protesto criado:", response.data);
      }
      navigate("/protestos");
    } catch (err) {
      console.error("❌ Erro ao salvar:", err);
      setError(err.response?.data?.message || "Erro ao salvar protesto.");
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

  const labelClass = "mb-1 block text-sm font-semibold text-brand-deep/80";
  const inputClass =
    "w-full rounded-xl border border-brand-muted bg-white px-4 py-3 text-brand-deep shadow-sm outline-none transition focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/40";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-brand-navy via-brand-turquoise-dark to-brand-green px-8 py-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.32em] text-white/70">
          Protestos
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {id ? "Atualizar registro de protesto" : "Cadastrar novo protesto"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          Controle valores protestados, status e dados cartoriais para manter a
          carteira atualizada.
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
              <label htmlFor="valor_protestado" className={labelClass}>
                Valor protestado *
              </label>
              <input
                id="valor_protestado"
                name="valor_protestado"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.valor_protestado}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="data_registro" className={labelClass}>
                Data do registro *
              </label>
              <input
                id="data_registro"
                name="data_registro"
                type="date"
                value={formData.data_registro}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="numero_parcela" className={labelClass}>
                Numero da parcela
              </label>
              <input
                id="numero_parcela"
                name="numero_parcela"
                type="text"
                value={formData.numero_parcela}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="protocolo" className={labelClass}>
                Protocolo
              </label>
              <input
                id="protocolo"
                name="protocolo"
                type="text"
                value={formData.protocolo}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="status" className={labelClass}>
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="data_baixa_cartorio" className={labelClass}>
                Data de baixa cartorio
              </label>
              <input
                id="data_baixa_cartorio"
                name="data_baixa_cartorio"
                type="text"
                placeholder="Ex: ANUENCIA 29/11/2024"
                value={formData.data_baixa_cartorio}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="situacao" className={labelClass}>
              Observacoes / situacao
            </label>
            <textarea
              id="situacao"
              name="situacao"
              value={formData.situacao}
              onChange={handleChange}
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <label htmlFor="contrato_id" className={labelClass}>
              Contrato relacionado
            </label>
            <div className="mb-3">
              <input
                type="text"
                value={contratoSearchTerm}
                onChange={(event) =>
                  setContratoSearchTerm(event.target.value.trimStart())
                }
                placeholder="Buscar contrato por número ou cliente"
                className={inputClass}
              />
              {contratosError && (
                <p className="mt-2 text-sm text-red-600">{contratosError}</p>
              )}
            </div>
            <select
              id="contrato_id"
              name="contrato_id"
              value={formData.contrato_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Selecione um contrato...</option>
              {contratosLoading && (
                <option disabled value="">
                  Carregando contratos...
                </option>
              )}
              {!contratosLoading && contratos.length === 0 && (
                <option disabled value="">
                  Nenhum contrato encontrado
                </option>
              )}
              {contratos.map((contrato) => (
                <option key={contrato.id} value={contrato.id}>
                  {contrato.numero_contrato_sisbr || `Contrato ${contrato.id}`}{" "}
                  - {contrato.cliente?.nome || "Cooperado nao informado"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand-muted/40 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/protestos")}
              className="inline-flex items-center justify-center rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Salvando..." : "Salvar protesto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProtestoForm;
