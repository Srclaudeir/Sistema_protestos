# Scripts do Sistema de Protestos

Este diretório contém apenas as ferramentas necessárias para importar e validar os dados da planilha oficial no banco de dados do sistema.

## Pré-requisitos

- Banco MySQL acessível com as credenciais definidas em `backend/.env`
- Arquivo `PLANILHA GERAL DE PROTESTOS.xlsx` na raiz do projeto
- Dependências instaladas:

```bash
cd scripts
npm install
```

## Fluxo recomendado

1. **(Opcional)** Conferir o total bruto na planilha:

   ```bash
   node calcularTotalExcel.js
   ```

2. **Importar dados do Excel (limpa as tabelas e insere tudo novamente):**

   ```bash
   node importarPlanilhaCompleta.js
   ```

   - Trunca as tabelas `clientes`, `contratos`, `protestos` e `avalistas`
   - Lê diretamente o Excel e replica fielmente cada coluna
   - Reconstrói clientes, contratos, protestos e avalistas

3. **Conferir totais no banco após a importação:**

   ```bash
   node calcularTotalProtestos.js
   ```

## Scripts disponíveis

| Script                       | Descrição                                                     |
|-----------------------------|----------------------------------------------------------------|
| `importarPlanilhaCompleta.js` | Limpa o banco e importa todos os dados diretamente da planilha |
| `calcularTotalExcel.js`       | Calcula estatísticas e o valor total diretamente do Excel       |
| `calcularTotalProtestos.js`   | Calcula totals e estatísticas direto no banco MySQL             |

## Observações

- A importação é executada usando o mesmo modelo Sequelize do backend, garantindo consistência.
- O script de importação assume que a planilha é a fonte da verdade e sobrescreve qualquer dado existente nas tabelas mencionadas.
- Execute sempre a etapa de conferência para garantir que a soma no banco e na planilha permaneçam idênticas.
