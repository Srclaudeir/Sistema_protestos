// src/pages/AvalistaForm.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { avalistasAPI, protestosAPI } from "../services/api";

const AvalistaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    cpf_cnpj: "",
    protesto_id: "",
  });
  const [protestos, setProtestos] = useState([]);
  const [protestosLoading, setProtestosLoading] = useState(false);
  const [protestosError, setProtestosError] = useState("");
  const [protestoSearchTerm, setProtestoSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mergeProtestos = useCallback((lista) => {
    const map = new Map();
    lista.forEach((protesto) => {
      if (!map.has(protesto.id)) {
        map.set(protesto.id, protesto);
      }
    });
    setProtestos(Array.from(map.values()));
  }, []);

  const fetchProtestos = useCallback(
    async (searchValue = "", selectedProtestoId = null) => {
      try {
        setProtestosLoading(true);
        setProtestosError("");

        const params = {
          limit: 50,
        };

        if (searchValue) {
          params.search = searchValue;
        }

        const response = await protestosAPI.getAll(params);
        const listaBase = response.data?.data ?? [];
        const protestosAtualizados = [...listaBase];

        if (
          selectedProtestoId &&
          !listaBase.some((protesto) => protesto.id === selectedProtestoId)
        ) {
          try {
            const protestoIndividual = await protestosAPI.getById(
              selectedProtestoId
            );
            if (protestoIndividual.data?.data) {
              protestosAtualizados.push(protestoIndividual.data.data);
            }
          } catch (innerError) {
            console.error("Erro ao carregar protesto selecionado:", innerError);
          }
        }

        mergeProtestos(protestosAtualizados);
      } catch (err) {
        console.error(err);
        setProtestosError(
          "Não foi possível carregar a lista de protestos. Tente novamente."
        );
      } finally {
        setProtestosLoading(false);
      }
    },
    [mergeProtestos]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProtestos(protestoSearchTerm, formData.protesto_id);
    }, 400);

    return () => clearTimeout(handler);
  }, [protestoSearchTerm, formData.protesto_id, fetchProtestos]);

  useEffect(() => {
    if (!id) return;

    const fetchAvalista = async () => {
      try {
        setLoading(true);
        const response = await avalistasAPI.getById(id);
        const data = response.data.data;
        setFormData({
          nome: data.nome ?? "",
          cpf_cnpj: data.cpf_cnpj ?? "",
          protesto_id: data.protesto_id ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados do avalista.");
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
    setError("");
    setLoading(true);

    try {
      if (id) {
        await avalistasAPI.update(id, formData);
      } else {
        await avalistasAPI.create(formData);
      }
      navigate("/avalistas");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao salvar avalista.");
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
          Avalistas
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {id ? "Atualizar avalista" : "Cadastrar novo avalista"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          Relacione o avalista ao protesto correspondente e mantenha os dados de
          contato organizados para tratativas.
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
            <div className="mb-3">
              <input
                type="text"
                value={protestoSearchTerm}
                onChange={(event) =>
                  setProtestoSearchTerm(event.target.value.trimStart())
                }
                placeholder="Buscar protesto por protocolo ou cliente"
                className={inputClass}
              />
              {protestosError && (
                <p className="mt-2 text-sm text-red-600">{protestosError}</p>
              )}
            </div>
            <select
              id="protesto_id"
              name="protesto_id"
              value={formData.protesto_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Selecione um protesto...</option>
              {protestosLoading && (
                <option disabled value="">
                  Carregando protestos...
                </option>
              )}
              {!protestosLoading && protestos.length === 0 && (
                <option disabled value="">
                  Nenhum protesto encontrado
                </option>
              )}
              {protestos.map((protesto) => (
                <option key={protesto.id} value={protesto.id}>
                  {protesto.protocolo || `Protesto ${protesto.id}`} -{" "}
                  {protesto.contrato?.cliente?.nome ||
                    "Cooperado não informado"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand-muted/40 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/avalistas")}
              className="inline-flex items-center justify-center rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Salvando..." : "Salvar avalista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvalistaForm;
