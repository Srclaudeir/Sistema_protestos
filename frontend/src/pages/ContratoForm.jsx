// src/pages/ContratoForm.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contratosAPI, clientesAPI, especiesAPI } from "../services/api";

const ContratoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    numero_contrato_sisbr: "",
    numero_contrato_legado: "",
    especie: "",
    ponto_atendimento: "",
    cliente_id: "",
  });
  const [clientes, setClientes] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [clientesError, setClientesError] = useState("");
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [especies, setEspecies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mergeClientes = useCallback((lista) => {
    const map = new Map();
    lista.forEach((cliente) => {
      if (!map.has(cliente.id)) {
        map.set(cliente.id, cliente);
      }
    });
    setClientes(Array.from(map.values()));
  }, []);

  const fetchClientes = useCallback(
    async (searchValue = "", selectedClienteId = null) => {
      try {
        setClientesLoading(true);
        setClientesError("");

        const params = {
          limit: 50,
        };

        if (searchValue) {
          params.search = searchValue;
        }

        const response = await clientesAPI.getAll(params);
        const listaBase = response.data?.data ?? [];
        const clientesAtualizados = [...listaBase];

        if (
          selectedClienteId &&
          !listaBase.some((cliente) => cliente.id === selectedClienteId)
        ) {
          try {
            const clienteIndividual = await clientesAPI.getById(
              selectedClienteId
            );
            if (clienteIndividual.data?.data) {
              clientesAtualizados.push(clienteIndividual.data.data);
            }
          } catch (innerError) {
            console.error("Erro ao carregar cliente selecionado:", innerError);
          }
        }

        mergeClientes(clientesAtualizados);
      } catch (err) {
        console.error(err);
        setClientesError(
          "Não foi possível carregar a lista de clientes. Tente novamente."
        );
      } finally {
        setClientesLoading(false);
      }
    },
    [mergeClientes]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchClientes(clienteSearchTerm, formData.cliente_id);
    }, 400);

    return () => clearTimeout(handler);
  }, [clienteSearchTerm, formData.cliente_id, fetchClientes]);

  // Carregar espécies ativas
  useEffect(() => {
    const fetchEspecies = async () => {
      try {
        const response = await especiesAPI.getAll({ ativo: true, limit: 100 });
        setEspecies(response.data.data || []);
      } catch (err) {
        console.error("Erro ao carregar espécies:", err);
      }
    };

    fetchEspecies();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchContrato = async () => {
      try {
        setLoading(true);
        const response = await contratosAPI.getById(id);
        const data = response.data.data;
        setFormData({
          numero_contrato_sisbr: data.numero_contrato_sisbr ?? "",
          numero_contrato_legado: data.numero_contrato_legado ?? "",
          especie: data.especie ?? "",
          ponto_atendimento: data.ponto_atendimento ?? "",
          cliente_id: data.cliente_id ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("Nao foi possivel carregar os dados do contrato.");
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
    setError("");
    setLoading(true);

    try {
      if (id) {
        await contratosAPI.update(id, formData);
      } else {
        await contratosAPI.create(formData);
      }
      navigate("/contratos");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao salvar contrato.");
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
          Contratos
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {id ? "Atualizar contrato" : "Cadastrar novo contrato"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/75">
          Identifique o contrato no SISBR, selecione o cliente vinculado e
          ajuste os dados complementares.
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
                {especies.map((especie) => (
                  <option key={especie.id} value={especie.nome}>
                    {especie.nome}
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
              Cooperado vinculado *
            </label>
            <div className="mb-3">
              <input
                type="text"
                value={clienteSearchTerm}
                onChange={(event) =>
                  setClienteSearchTerm(event.target.value.trimStart())
                }
                placeholder="Buscar cooperado por nome ou CPF/CNPJ"
                className={inputClass}
              />
              {clientesError && (
                <p className="mt-2 text-sm text-red-600">{clientesError}</p>
              )}
            </div>
            <select
              id="cliente_id"
              name="cliente_id"
              value={formData.cliente_id}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Selecione um cooperado...</option>
              {clientesLoading && (
                <option disabled value="">
                  Carregando cooperados...
                </option>
              )}
              {!clientesLoading && clientes.length === 0 && (
                <option disabled value="">
                  Nenhum cooperado encontrado
                </option>
              )}
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}{" "}
                  {cliente.cpf_cnpj ? `(${cliente.cpf_cnpj})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand-muted/40 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/contratos")}
              className="inline-flex items-center justify-center rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Salvando..." : "Salvar contrato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContratoForm;
