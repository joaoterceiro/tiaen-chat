# 🗄️ Configuração do Banco de Dados Supabase

## 📋 Visão Geral

Este documento contém as instruções completas para configurar o banco de dados Supabase para o **Tiaen Chat**, incluindo todas as tabelas, índices, políticas de segurança e funções necessárias.

## 🚀 Configuração Inicial

### 1. **Criar Projeto no Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Configure:
   - **Nome**: `tiaen-chat`
   - **Região**: `South America (São Paulo)`
   - **Password**: Senha segura para o banco

### 2. **Executar o Schema**

1. No dashboard do Supabase, vá para **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase-schema.sql`
3. Cole no editor e execute
4. Aguarde a conclusão (pode levar alguns minutos)

### 3. **Configurar Variáveis de Ambiente**

Adicione ao seu arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

## 📊 Estrutura do Banco

### **Tabelas Principais**

#### 🧑‍💼 **Usuários e Perfis**
- `profiles` - Perfis dos usuários (estende auth.users)

#### 💬 **Sistema de Chat**
- `contacts` - Contatos do WhatsApp
- `conversations` - Conversas agrupadas
- `messages` - Mensagens individuais

#### 🧠 **Sistema RAG (IA)**
- `knowledge_base` - Base de conhecimento com embeddings
- `rag_queries` - Histórico de consultas RAG
- `ai_configurations` - Configurações de IA

#### ⚡ **Automação**
- `automation_rules` - Regras de automação
- `automation_executions` - Log de execuções

#### 📱 **Evolution API**
- `evolution_instances` - Instâncias do WhatsApp

#### 📈 **Analytics**
- `daily_metrics` - Métricas diárias
- `hourly_metrics` - Métricas por hora
- `activity_logs` - Log de atividades

#### ⚙️ **Configurações**
- `system_settings` - Configurações globais

## 🔒 Segurança (RLS)

### **Row Level Security Habilitado**

Todas as tabelas possuem RLS (Row Level Security) configurado com políticas específicas:

- ✅ **Usuários autenticados** podem acessar dados relevantes
- ✅ **Perfis próprios** são privados
- ✅ **Dados sensíveis** protegidos
- ✅ **API keys** criptografadas

### **Políticas Principais**

```sql
-- Usuários podem ver apenas seu perfil
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- Usuários autenticados podem ver contatos
CREATE POLICY "Authenticated users can view contacts" ON contacts 
FOR SELECT TO authenticated USING (true);
```

## 🚀 Funcionalidades Avançadas

### **1. Vector Search (RAG)**

```sql
-- Busca por similaridade semântica
SELECT * FROM search_knowledge(
    query_embedding, 
    0.7, -- threshold
    5    -- limit
);
```

### **2. Métricas Automáticas**

```sql
-- Calcular métricas do dia
SELECT calculate_daily_metrics('2024-01-15');
```

### **3. Triggers Automáticos**

- ✅ **updated_at** atualizado automaticamente
- ✅ **Logs de atividade** criados automaticamente
- ✅ **Métricas** calculadas em tempo real

## 📝 Dados Iniciais

### **Configurações do Sistema**

```sql
-- Configurações básicas inseridas automaticamente
INSERT INTO system_settings (key, value, description) VALUES
('app_name', '"Tiaen Chat"', 'Nome da aplicação'),
('default_language', '"pt-BR"', 'Idioma padrão'),
('timezone', '"America/Sao_Paulo"', 'Fuso horário');
```

### **Configuração de IA**

```sql
-- Configuração padrão do OpenAI
INSERT INTO ai_configurations (name, provider, model) VALUES
('Default OpenAI', 'openai', 'gpt-3.5-turbo');
```

## 🔧 Configurações Adicionais

### **1. Extensões Necessárias**

```sql
-- Vector para embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- UUID para IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **2. Índices de Performance**

- ✅ **Busca por telefone** otimizada
- ✅ **Consultas por data** rápidas
- ✅ **Vector search** eficiente
- ✅ **Filtros por status** indexados

### **3. Backup e Manutenção**

```sql
-- Limpeza de logs antigos (executar mensalmente)
DELETE FROM activity_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Arquivar conversas antigas
UPDATE conversations 
SET status = 'archived' 
WHERE last_message_at < NOW() - INTERVAL '30 days' 
AND status = 'resolved';
```

## 🔌 Integrações

### **1. Evolution API**

Configure as instâncias do WhatsApp:

```sql
INSERT INTO evolution_instances (name, webhook_url) VALUES
('principal', 'https://seu-app.com/api/webhook');
```

### **2. OpenAI Embeddings**

Para usar o RAG, configure:

1. Obtenha uma API key do OpenAI
2. Configure no dashboard ou via SQL:

```sql
UPDATE ai_configurations 
SET api_key_encrypted = 'sua-chave-openai'
WHERE name = 'Default OpenAI';
```

## 📊 Monitoramento

### **Consultas Úteis**

```sql
-- Conversas ativas hoje
SELECT COUNT(*) FROM conversations 
WHERE DATE(created_at) = CURRENT_DATE;

-- Mensagens por hora
SELECT 
    EXTRACT(hour FROM timestamp) as hora,
    COUNT(*) as total
FROM messages 
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY hora
ORDER BY hora;

-- Top conhecimentos utilizados
SELECT title, usage_count 
FROM knowledge_base 
ORDER BY usage_count DESC 
LIMIT 10;
```

## 🚨 Troubleshooting

### **Problemas Comuns**

1. **Erro de permissão**: Verifique se RLS está configurado
2. **Vector search lento**: Verifique se o índice ivfflat foi criado
3. **Triggers não funcionam**: Execute novamente as funções de trigger

### **Logs de Debug**

```sql
-- Ver últimas atividades
SELECT * FROM activity_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- Verificar execuções de automação
SELECT * FROM automation_executions 
WHERE status = 'failed'
ORDER BY executed_at DESC;
```

## ✅ Checklist de Configuração

- [ ] Projeto Supabase criado
- [ ] Schema executado com sucesso
- [ ] Extensões habilitadas
- [ ] RLS configurado
- [ ] Variáveis de ambiente definidas
- [ ] Dados iniciais inseridos
- [ ] Testes de conexão realizados
- [ ] Backup configurado

## 🔄 Atualizações Futuras

Para futuras atualizações do schema:

1. Crie migrations incrementais
2. Teste em ambiente de desenvolvimento
3. Execute backup antes da produção
4. Aplique as mudanças gradualmente

---

**🎉 Banco de dados configurado e pronto para uso!** 