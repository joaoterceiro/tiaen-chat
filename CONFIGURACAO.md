# Configuração do Projeto Tiaen Chat

## ⚠️ IMPORTANTE - Configuração Obrigatória

**O projeto NÃO funcionará sem a configuração correta do Supabase!** 

As variáveis de ambiente são essenciais para:
- Persistência de dados (configurações, conversas, contatos, etc.)
- Autenticação de usuários
- Sistema RAG (base de conhecimento)
- Analytics e métricas

## Variáveis de Ambiente

### 1. Copie o arquivo de exemplo
```bash
cp env.example .env.local
```

### 2. Configure as variáveis no arquivo `.env.local`:

```env
# Configurações do Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# OpenAI Configuration (opcional - pode ser configurado via interface)
OPENAI_API_KEY=sk-your-openai-key-here

# Evolution API Configuration (opcional - pode ser configurado via interface)
EVOLUTION_API_URL=https://your-evolution-api.com
EVOLUTION_API_KEY=your-evolution-api-key-here
```

## Como obter as credenciais do Supabase

### Passo 1: Criar Projeto
1. Acesse [https://supabase.com/](https://supabase.com/)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha os dados:
   - **Nome**: `tiaen-chat` (ou outro nome)
   - **Senha do DB**: Use uma senha forte e **ANOTE ela**
   - **Região**: Escolha South America (São Paulo) ou a mais próxima
5. Aguarde a criação (2-3 minutos)

### Passo 2: Obter Credenciais
1. Após criação, vá para **Settings** > **API**
2. Copie os valores:
   - **URL**: valor para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: valor para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Passo 3: Configurar Banco de Dados
1. No painel do Supabase, vá para **SQL Editor**
2. Execute os scripts na seguinte ordem:
   ```sql
   -- 1. Primeiro execute: database/supabase-schema.sql
   -- 2. Depois execute: database/sample-data.sql
   ```

### Passo 4: Configurar Autenticação
1. Vá para **Authentication** > **Settings**
2. Em **Site URL**, adicione: `http://localhost:3000`
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/auth/callback`
   - `https://seudominio.com/auth/callback` (para produção)

## Executar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente (ver seção acima)
cp env.example .env.local
# Edite o .env.local com suas credenciais

# 3. Executar em desenvolvimento
npm run dev

# 4. Acessar: http://localhost:3000
```

## Verificar se está funcionando

### 1. Teste de Conexão
- Acesse `http://localhost:3000`
- Faça login/cadastro
- Vá para o Dashboard
- Se aparecer dados nas métricas, está funcionando!

### 2. Teste de Persistência
- Vá para **Conversas** > **Base de Conhecimento**
- Adicione um novo conhecimento
- Recarregue a página
- Se o conhecimento persistir, está funcionando!

### 3. Verificar Erros
- Abra o **DevTools** (F12)
- Vá para **Console**
- Se houver erros relacionados ao Supabase, verifique as credenciais

## Estrutura do Banco de Dados

O projeto utiliza 14 tabelas principais:

### Core
- `profiles` - Perfis de usuários
- `contacts` - Contatos do WhatsApp
- `conversations` - Conversas agrupadas
- `messages` - Mensagens individuais

### Sistema RAG
- `knowledge_base` - Base de conhecimento com embeddings
- `rag_queries` - Histórico de consultas RAG
- `ai_configurations` - Configurações de IA

### Automação
- `automation_rules` - Regras de automação
- `automation_executions` - Log de execuções

### Evolution API
- `evolution_instances` - Instâncias do WhatsApp

### Analytics
- `daily_metrics` - Métricas diárias
- `hourly_metrics` - Métricas por hora
- `activity_logs` - Log de atividades

### Configurações
- `system_settings` - Configurações globais

## Funcionalidades Implementadas

### ✅ Autenticação
- Login/cadastro com email/senha
- Proteção de rotas
- Middleware de autenticação
- Redirecionamento inteligente

### ✅ Dashboard
- Métricas em tempo real
- Estatísticas de conversas
- Ações rápidas
- Analytics detalhadas

### ✅ Sistema RAG
- Base de conhecimento
- Busca semântica
- Configuração OpenAI/Evolution
- Instâncias WhatsApp

### ✅ Gestão de Contatos
- CRUD completo
- Busca avançada
- Tags e notas
- Status online

### ✅ Analytics
- Métricas temporais
- Gráficos interativos
- Exportação CSV
- Filtros de período

## Problemas Comuns e Soluções

### ❌ "Dados não estão salvando"
**Causa**: Variáveis de ambiente não configuradas
**Solução**: 
1. Verifique se o arquivo `.env.local` existe
2. Confirme se as credenciais do Supabase estão corretas
3. Teste a conexão no DevTools (F12 > Console)

### ❌ Erro de CORS
**Causa**: URLs de redirecionamento incorretas
**Solução**:
1. No Supabase: Authentication > Settings
2. Adicione `http://localhost:3000/auth/callback`
3. Para produção, adicione sua URL

### ❌ "Failed to fetch"
**Causa**: Projeto Supabase pausado ou credenciais inválidas
**Solução**:
1. Verifique se o projeto está ativo no Supabase
2. Confirme se as credenciais estão corretas
3. Teste manualmente no SQL Editor do Supabase

### ❌ Erro de autenticação
**Causa**: Configurações de auth incorretas
**Solução**:
1. Verifique Authentication > Settings no Supabase
2. Confirme se email/password está habilitado
3. Verifique as URLs de redirecionamento

### ❌ Erro de build
**Causa**: Dependências ou TypeScript
**Solução**:
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar TypeScript
npm run type-check
```

## Suporte e Documentação

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Projeto GitHub**: (adicione seu repositório aqui)

## Checklist de Configuração

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas para `.env.local`
- [ ] Scripts SQL executados (`supabase-schema.sql` + `sample-data.sql`)
- [ ] URLs de redirecionamento configuradas
- [ ] `npm install` executado
- [ ] `npm run dev` funcionando
- [ ] Login/cadastro funcionando
- [ ] Dashboard carregando dados
- [ ] Base de conhecimento persistindo dados

Se todos os itens estiverem ✅, o projeto está configurado corretamente! 