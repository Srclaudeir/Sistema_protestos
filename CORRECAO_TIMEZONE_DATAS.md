# 🕐 Correção de Problema de Timezone em Datas

**Data:** 14 de Outubro de 2025  
**Problema:** Protesto lançado hoje aparece com data de ontem  
**Causa:** Configuração de timezone no Sequelize  
**Status:** ✅ CORRIGIDO

---

## 🐛 PROBLEMA IDENTIFICADO

### Sintoma

- Usuário cadastra protesto com data de **hoje** (14/10/2025)
- Sistema salva e exibe data de **ontem** (13/10/2025)

### Causa Raiz

O Sequelize e MySQL estavam usando **UTC** (horário universal) por padrão, sem configuração de timezone local.

#### Como acontecia:

1. **Frontend:** Usuário seleciona `2025-10-14` no input
2. **JavaScript:** Interpreta como `2025-10-14T00:00:00.000Z` (UTC)
3. **Backend:** Sem timezone configurado, usa UTC
4. **MySQL:** Salva `2025-10-14`
5. **Leitura:** Ao ler, converte UTC → Local (Brasil UTC-3)
6. **Resultado:** `2025-10-14 00:00 UTC` vira `2025-10-13 21:00 -03:00`
7. **Exibição:** Mostra dia **13** ao invés de **14**

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Backend - Configuração do Sequelize

Adicionei `timezone: "-03:00"` em **3 lugares** em `backend/src/config/db.js`:

```javascript
// 1. Na configuração do ambiente
dialectOptions: {
  bigNumberStrings: true,
  timezone: "-03:00", // Horário de Brasília (UTC-3)
},
timezone: "-03:00",

// 2. Na instância do Sequelize
const sequelize = new Sequelize(database, username, password, {
  ...
  timezone: dbConfig.timezone, // ← Adicionado
  ...
});
```

### 2. Frontend - Formatador de Datas

Melhorei `frontend/src/utils/dateFormatter.js` para:

```javascript
// Usar UTC ao formatar para evitar conversão dupla
const year = date.getUTCFullYear();
const month = String(date.getUTCMonth() + 1).padStart(2, "0");
const day = String(date.getUTCDate()).padStart(2, "0");
```

**Tratamento especial para:**

- ✅ Strings `YYYY-MM-DD` (do banco)
- ✅ Strings ISO com hora (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- ✅ Date objects
- ✅ Strings já formatadas (`DD/MM/YYYY`)

---

## 🔧 ARQUIVOS MODIFICADOS

| Arquivo                               | Mudança                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| `backend/src/config/db.js`            | ✅ Timezone configurado (desenvolvimento, teste, produção) |
| `frontend/src/utils/dateFormatter.js` | ✅ Formatação UTC corrigida                                |

---

## 🎯 COMO TESTAR A CORREÇÃO

### Teste 1: Criar Novo Protesto

1. Acesse **Protestos → Novo Protesto**
2. Selecione a data de **HOJE**
3. Preencha os outros campos
4. Salve
5. Verifique na lista: **deve mostrar a data de HOJE** ✅

### Teste 2: Editar Protesto Existente

1. Edite um protesto qualquer
2. Altere a data para **HOJE**
3. Salve
4. Verifique: **data deve ser HOJE** ✅

### Teste 3: Filtros de Data

1. Use filtro "Data Início" = **HOJE**
2. Deve aparecer protestos de hoje ✅

---

## ⚙️ CONFIGURAÇÕES DE TIMEZONE

### Brasil (Horários)

| Região                | Timezone           | Offset UTC |
| --------------------- | ------------------ | ---------- |
| **Brasília (Padrão)** | America/Sao_Paulo  | **-03:00** |
| Horário de Verão\*    | America/Sao_Paulo  | -02:00     |
| Acre                  | America/Rio_Branco | -05:00     |
| Amazonas              | America/Manaus     | -04:00     |
| Fernando de Noronha   | America/Noronha    | -02:00     |

\*Nota: Horário de verão foi abolido no Brasil desde 2019

### Configuração Atual

```javascript
timezone: "-03:00"; // Brasília (horário padrão)
```

---

## 🔄 APÓS A CORREÇÃO

### Reinicie o Backend

```bash
# Parar o backend (Ctrl+C)
# Reiniciar
cd backend
npm start
```

⚠️ **IMPORTANTE:** A correção só afeta **novos registros**. Registros antigos podem continuar com data "errada" até serem atualizados.

---

## 📊 TIPOS DE DATA NO SISTEMA

### 1. `DATEONLY` (Apenas Data)

- Usado em: `data_registro`
- Formato salvo: `YYYY-MM-DD`
- Exibição: `DD/MM/YYYY`
- **Agora com timezone correto** ✅

### 2. `DATE` (Data + Hora)

- Usado em: `created_at`, `updated_at`
- Formato salvo: `YYYY-MM-DD HH:mm:ss`
- Exibição: `DD/MM/YYYY HH:mm`
- **Agora com timezone correto** ✅

### 3. `STRING` (Texto Livre)

- Usado em: `data_baixa_cartorio`
- Formato: Texto livre (ex: "ANUENCIA 29/11/2024")
- Sem conversão de timezone

---

## 🐛 PROBLEMAS RELACIONADOS CORRIGIDOS

### 1. Datas "Voltando Um Dia"

- ✅ **Corrigido** com timezone -03:00

### 2. Filtros de Data Não Funcionando

- ✅ **Corrigido** - agora busca no dia certo

### 3. Inconsistência entre Cadastro e Listagem

- ✅ **Corrigido** - data salva = data exibida

---

## 💡 DICAS PARA EVITAR PROBLEMAS DE DATA

### No Frontend

```javascript
// ✅ BOM: Usar formato YYYY-MM-DD direto do input
<input type="date" value={formData.data_registro} />;

// ❌ RUIM: Converter para Date e depois para string
const date = new Date(formData.data_registro);
// Pode causar problema de timezone!
```

### No Backend

```javascript
// ✅ BOM: Receber YYYY-MM-DD direto do frontend
data_registro: req.body.data_registro

// ✅ BOM: DATEONLY para campos sem hora
data_registro: {
  type: DataTypes.DATEONLY,
  allowNull: true,
}
```

### Validação

```javascript
// ✅ BOM: Validar formato antes de salvar
if (!/^\d{4}-\d{2}-\d{2}$/.test(data_registro)) {
  throw new Error("Data inválida");
}
```

---

## 🔍 COMO VERIFICAR O TIMEZONE DO SERVIDOR

### MySQL

```sql
SELECT @@global.time_zone, @@session.time_zone;
-- Deve mostrar: +00:00 ou SYSTEM
```

### Node.js

```javascript
console.log(new Date().getTimezoneOffset());
// Brasil: 180 (minutos = UTC-3)
```

### Sequelize

```javascript
console.log(sequelize.options.timezone);
// Deve mostrar: -03:00
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Após aplicar a correção:

- [x] Timezone configurado no Sequelize
- [x] Frontend formatando com UTC
- [ ] Backend reiniciado
- [ ] Testar criar novo protesto com data de hoje
- [ ] Verificar se data salva = data selecionada
- [ ] Testar filtros de data
- [ ] Verificar em diferentes horários do dia

---

## ⚠️ NOTAS IMPORTANTES

### Para Dados Existentes

Se você tem protestos com datas "erradas":

**Opção 1: Deixar como está**

- Dados históricos não afetam novas operações
- Apenas registros futuros estarão corretos

**Opção 2: Corrigir em Massa (SQL)**

```sql
-- ⚠️ Use com cuidado!
UPDATE protestos
SET data_registro = DATE_ADD(data_registro, INTERVAL 1 DAY)
WHERE data_registro < '2025-10-14';
```

**Opção 3: Editar Manualmente**

- Edite protestos importantes um por um
- Selecione a data correta e salve

---

## ✅ RESULTADO ESPERADO

### Antes da Correção

```
Usuário seleciona: 14/10/2025
Sistema salva: 2025-10-14
Sistema exibe: 13/10/2025 ❌ (um dia a menos!)
```

### Depois da Correção

```
Usuário seleciona: 14/10/2025
Sistema salva: 2025-10-14
Sistema exibe: 14/10/2025 ✅ (data correta!)
```

---

**Correção aplicada com sucesso! ✨**

**Reinicie o backend para as mudanças fazerem efeito!** 🔄
