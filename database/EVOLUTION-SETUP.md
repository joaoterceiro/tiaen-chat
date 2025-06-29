# 🔧 Setup da Tabela Evolution Instances

## 📋 **Passo a Passo para Configurar**

### 1. **Acesse o Supabase Dashboard**
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione seu projeto
- Clique em **SQL Editor** no menu lateral

### 2. **Execute o SQL**
Copie e cole o conteúdo do arquivo `evolution-instances-table.sql` no editor SQL e execute.

### 3. **Verificar se a Tabela foi Criada**
Execute esta query para verificar:

```sql
SELECT * FROM evolution_instances;
```

## 🔍 **Estrutura da Tabela**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da instância |
| `instance_name` | VARCHAR(100) | Nome único da instância |
| `ai_enabled` | BOOLEAN | Se a IA está habilitada |
| `auto_response` | BOOLEAN | Se respostas automáticas estão ativas |
| `welcome_message` | TEXT | Mensagem de boas-vindas |
| `status` | VARCHAR(20) | Status: 'open', 'close', 'connecting' |
| `webhook_configured` | BOOLEAN | Se webhook foi configurado |
| `webhook_url` | TEXT | URL do webhook |
| `api_key` | TEXT | Chave da API Evolution |
| `phone` | VARCHAR(20) | Número do WhatsApp |
| `profile_picture_url` | TEXT | URL da foto de perfil |
| `last_connection` | TIMESTAMP | Última conexão |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

## ✅ **Verificação Final**

Após executar o SQL, você deve ver:
1. ✅ Tabela `evolution_instances` criada
2. ✅ Índices criados para performance
3. ✅ Trigger para `updated_at` automático
4. ✅ 3 instâncias de exemplo inseridas

## 🚀 **Próximos Passos**

Depois de criar a tabela:
1. A interface `/evolution` já funcionará
2. Você poderá criar novas instâncias
3. Configurar webhooks automaticamente
4. Gerenciar IA e respostas automáticas

## 🔧 **Comandos Úteis**

```sql
-- Ver todas as instâncias
SELECT * FROM evolution_instances ORDER BY created_at DESC;

-- Atualizar status de uma instância
UPDATE evolution_instances 
SET status = 'open', last_connection = NOW() 
WHERE instance_name = 'atendimento';

-- Configurar webhook
UPDATE evolution_instances 
SET webhook_configured = true, webhook_url = 'https://seu-app.com/api/rag/webhook'
WHERE instance_name = 'atendimento';
``` 