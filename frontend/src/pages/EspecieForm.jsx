// src/pages/EspecieForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { especiesAPI } from "../services/api";

const EspecieForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ativo: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchEspecie = async () => {
      try {
        setLoading(true);
        const response = await especiesAPI.getById(id);
        const data = response.data.data;
        setFormData({
          nome: data.nome ?? "",
          descricao: data.descricao ?? "",
          ativo: data.ativo ?? true,
        });
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados da espécie.");
      } finally {
        setLoading(false);
      }
    };

    fetchEspecie();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (id) {
        await especiesAPI.update(id, formData);
      } else {
        await especiesAPI.create(formData);
      }
      navigate("/especies");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao salvar espécie.");
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
          Administração
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {id ? "Atualizar espécie" : "Cadastrar nova espécie"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          {id
            ? "Atualize as informações da espécie de contrato."
            : "Cadastre uma nova espécie de contrato para uso no sistema."}
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
                Nome da espécie *
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: CARTÃO, VEÍCULO, PRONAMPE..."
                className={inputClass}
              />
              <p className="mt-1 text-xs text-brand-muted">
                Nome único que identifica a espécie de contrato
              </p>
            </div>

            <div>
              <label htmlFor="descricao" className={labelClass}>
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={4}
                placeholder="Descreva brevemente esta espécie de contrato..."
                className={inputClass}
              />
              <p className="mt-1 text-xs text-brand-muted">
                Descrição opcional para melhor identificação da espécie
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="ativo"
                name="ativo"
                type="checkbox"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 rounded border-brand-muted text-brand-turquoise focus:ring-brand-turquoise/40"
              />
              <label
                htmlFor="ativo"
                className="ml-2 text-sm font-medium text-brand-deep"
              >
                Espécie ativa
              </label>
              <p className="ml-2 text-xs text-brand-muted">
                (Espécies inativas não aparecerão nas listas de seleção)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand-muted/40 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/especies")}
              className="inline-flex items-center justify-center rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Salvando..." : "Salvar espécie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EspecieForm;
