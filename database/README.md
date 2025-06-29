# 🗄️ Database - Tiaen Chat

Este diretório contém todos os arquivos relacionados ao banco de dados Supabase do **Tiaen Chat**.

## 📁 Estrutura dos Arquivos

### 🚀 **supabase-schema.sql**
**Schema principal do banco de dados**

- ✅ **14 tabelas** principais com relacionamentos
- ✅ **Extensões** necessárias (uuid-ossp, vector)
- ✅ **Índices** otimizados para performance
- ✅ **Triggers** automáticos para updated_at
- ✅ **Row Level Security (RLS)** completo
- ✅ **Funções utilitárias** para RAG e métricas
- ✅ **Dados iniciais** de configuração

**Tabelas incluídas:**
- `profiles` - Perfis de usuários
- `contacts` - Contatos do WhatsApp
- `conversations` - Conversas agrupadas
- `messages` - Mensagens individuais
- `knowledge_base` - Base de conhecimento (RAG)
- `rag_queries` - Histórico de consultas RAG
- `automation_rules` - Regras de automação
- `automation_executions` - Log de execuções
- `evolution_instances` - Instâncias WhatsApp
- `daily_metrics` - Métricas diárias
- `hourly_metrics` - Métricas por hora
- `activity_logs` - Log de atividades
- `system_settings` - Configurações globais
- `ai_configurations` - Configurações de IA

### 📊 **sample-data.sql**
**Dados de exemplo para testes**

- 🧑‍💼 **8 contatos** de exemplo
- 💬 **Conversas** com diferentes status
- 📱 **Mensagens** realistas de WhatsApp
- 🧠 **Base de conhecimento** pré-populada
- ⚡ **Regras de automação** funcionais
- 📈 **Métricas** dos últimos 7 dias
- 📝 **Logs de atividade** simulados

### 🔧 **migrations.sql**
**Scripts de manutenção e migração**

**Funcionalidades:**
- 🧹 **Limpeza automática** de logs antigos
- 📦 **Arquivamento** de conversas antigas
- 📊 **Cálculo de métricas** diárias
- 🔍 **Reindexação** de tabelas
- 💾 **Backup** de configurações críticas
- 🚀 **Migrações** futuras (v1.1, v1.2, v1.3)
- 🔒 **Auditoria** de segurança
- 📋 **Monitoramento** de saúde do banco

### 📖 **SUPABASE-SETUP.md**
**Guia completo de configuração**

- 🎯 **Passo a passo** para configurar Supabase
- ⚙️ **Variáveis de ambiente** necessárias
- 🔒 **Configurações de segurança** (RLS)
- 🚀 **Funcionalidades avançadas** (Vector Search)
- 🔧 **Troubleshooting** comum
- ✅ **Checklist** de configuração

## 🚀 Como Usar

### 1. **Configuração Inicial**

```bash
# 1. Criar projeto no Supabase
# 2. Executar schema principal
supabase db reset --with-seed
```

### 2. **Executar Schema**

No **SQL Editor** do Supabase:

```sql
-- 1. Copiar e executar supabase-schema.sql
-- 2. Aguardar conclusão (pode demorar alguns minutos)
-- 3. Verificar se todas as tabelas foram criadas
```

### 3. **Adicionar Dados de Teste**

```sql
-- Executar sample-data.sql para popular com dados de exemplo
-- Útil para desenvolvimento e testes
```

### 4. **Configurar .env.local**

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

## 🔍 Funcionalidades Principais

### **🧠 Sistema RAG (Inteligência Artificial)**
- Vector search com embeddings OpenAI
- Base de conhecimento semântica
- Consultas inteligentes com confiança
- Histórico de respostas da IA

### **💬 Sistema de Chat Completo**
- Contatos com perfis e tags
- Conversas organizadas por status
- Mensagens com tipos e metadados
- Integração com Evolution API

### **⚡ Automação Avançada**
- Regras configuráveis por triggers
- Execução automática de ações
- Log completo de execuções
- Suporte a webhooks

### **📈 Analytics em Tempo Real**
- Métricas diárias e horárias
- Relatórios de performance
- Monitoramento de atividades
- Dashboards interativos

### **🔒 Segurança Robusta**
- Row Level Security (RLS) em todas as tabelas
- Políticas de acesso granulares
- Auditoria de ações dos usuários
- Criptografia de dados sensíveis

## 🛠️ Manutenção

### **Scripts Automáticos**

```sql
-- Limpeza mensal de logs
SELECT cleanup_old_logs();

-- Arquivamento de conversas antigas
SELECT archive_old_conversations();

-- Atualização de métricas
SELECT update_daily_metrics();

-- Verificação de saúde
SELECT * FROM check_database_health();
```

### **Monitoramento**

```sql
-- Relatório de uso de recursos
SELECT * FROM resource_usage_report();

-- Auditoria de acessos
SELECT * FROM audit_user_access();

-- Verificar políticas RLS
SELECT * FROM check_rls_policies();
```

## 🔄 Migrações Futuras

### **v1.1 - Geolocalização**
- Campos de latitude/longitude nos contatos
- Índices para busca por localização

### **v1.2 - Templates de Mensagem**
- Sistema de templates reutilizáveis
- Variáveis dinâmicas

### **v1.3 - Sistema de Tags Avançado**
- Tags com cores personalizadas
- Relacionamentos N:N com contatos

## 📊 Métricas e Performance

### **Índices Otimizados**
- Busca por telefone: `O(log n)`
- Consultas por data: `O(log n)`
- Vector search: `O(log n)` com IVFFlat
- Filtros por status: `O(log n)`

### **Capacidade**
- **Contatos**: Milhões de registros
- **Mensagens**: Bilhões de registros
- **Vector Search**: Sub-segundo
- **Métricas**: Tempo real

## 🚨 Troubleshooting

### **Problemas Comuns**

1. **Erro de permissão**
   - Verificar se RLS está configurado
   - Confirmar políticas de acesso

2. **Vector search lento**
   - Verificar índice ivfflat
   - Ajustar parâmetro `lists`

3. **Triggers não funcionam**
   - Re-executar funções de trigger
   - Verificar permissões

### **Logs de Debug**

```sql
-- Ver últimas atividades
SELECT * FROM activity_logs 
ORDER BY created_at DESC LIMIT 50;

-- Verificar execuções falhadas
SELECT * FROM automation_executions 
WHERE status = 'failed'
ORDER BY executed_at DESC;
```

## ✅ Checklist de Verificação

- [ ] ✅ Schema principal executado
- [ ] ✅ Extensões habilitadas (uuid-ossp, vector)
- [ ] ✅ RLS configurado em todas as tabelas
- [ ] ✅ Índices criados com sucesso
- [ ] ✅ Triggers funcionando
- [ ] ✅ Dados iniciais inseridos
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Testes de conectividade realizados
- [ ] ✅ Backup configurado

## 🎯 Próximos Passos

1. **Executar schema** no Supabase
2. **Configurar variáveis** de ambiente
3. **Testar conectividade** da aplicação
4. **Popular com dados** de exemplo
5. **Configurar monitoramento** automático

---

**🎉 Banco de dados pronto para produção!**

> **Nota**: Este schema foi projetado para escalar e suportar milhões de mensagens e milhares de usuários simultâneos, mantendo performance otimizada e segurança robusta. 