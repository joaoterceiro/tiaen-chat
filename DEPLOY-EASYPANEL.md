# Deploy no Easypanel - Tiaen Chat

## ✅ Repositório GitHub Configurado

**Repositório**: [https://github.com/joaoterceiro/tiaen-chat.git](https://github.com/joaoterceiro/tiaen-chat.git)

O código foi enviado com sucesso! 🚀

## 🚀 Deploy no Easypanel - Passo a Passo

### 1. Acessar Easypanel

1. Faça login no seu painel Easypanel
2. Clique em **"New Project"** ou **"Create App"**

### 2. Configurar Repositório

1. **Tipo**: Selecione **"GitHub Repository"**
2. **Repository**: `joaoterceiro/tiaen-chat`
3. **Branch**: `main`
4. **Auto Deploy**: ✅ Ativado (para deploy automático)

### 3. Configurações de Build

```yaml
# Build Settings
Build Command: npm install && npm run build
Start Command: npm start
Port: 3000
Node Version: 18
Framework: Next.js
```

### 4. Variáveis de Ambiente

**Configure estas variáveis no painel do Easypanel:**

```env
# Environment
NODE_ENV=production

# Supabase (suas credenciais)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-supabase

# Evolution API (configure sua instância)
NEXT_PUBLIC_EVOLUTION_API_URL=https://sua-evolution-api.com
NEXT_PUBLIC_EVOLUTION_API_KEY=sua-chave-evolution-api
NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL=https://seu-dominio.easypanel.host/api/rag/webhook

# OpenAI (sua chave)
OPENAI_API_KEY=sk-sua-chave-openai

# Authentication
NEXTAUTH_SECRET=sua-chave-secreta-super-forte-123456789
NEXTAUTH_URL=https://seu-dominio.easypanel.host
```

### 5. Domínio

O Easypanel vai fornecer um domínio automático como:
- `https://tiaen-chat.easypanel.host`
- Ou configure seu domínio personalizado

### 6. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Acesse a URL fornecida

## 🔧 Configuração Pós-Deploy

### 1. Primeiro Acesso

1. **Acesse**: `https://seu-dominio.easypanel.host`
2. **Teste login**: Verifique se a autenticação funciona
3. **Navegue**: Dashboard, conversas, sistema RAG

### 2. Configurar Sistema RAG

1. **Acesse**: `https://seu-dominio.easypanel.host/rag`
2. **Configure OpenAI**:
   - API Key: `sk-sua-chave...`
   - Modelo: `gpt-3.5-turbo`
   - Temperature: `0.7`
   - Max Tokens: `1000`

3. **Configure Evolution API**:
   - Base URL: `https://sua-evolution-api.com`
   - API Key: `sua-chave`
   - Webhook: `https://seu-dominio.easypanel.host/api/rag/webhook`

### 3. Configurar WhatsApp

1. **Criar Instância**:
   - Nome: `tiaen-prod`
   - Escaneie QR Code
   - Aguarde conexão

2. **Testar Webhook**:
   - Envie mensagem para o WhatsApp
   - Verifique se aparece em `/conversas`

### 4. Base de Conhecimento

1. **Acesse**: Sistema RAG > Knowledge Base
2. **Adicione conteúdo**:
   - FAQ da empresa
   - Informações de produtos
   - Procedimentos

## 📊 Funcionalidades Disponíveis

### ✅ Implementado e Funcionando

- **Dashboard**: Métricas em tempo real
- **Chat WhatsApp**: Interface completa
- **Sistema RAG**: IA com base de conhecimento
- **Automação**: Respostas automáticas
- **Analytics**: Gráficos e relatórios
- **Webhook**: Recebimento em tempo real
- **Autenticação**: Login seguro

### 🎯 Páginas Principais

- `/` - Página inicial
- `/dashboard` - Dashboard principal
- `/conversas` - Chat WhatsApp
- `/rag` - Sistema RAG e configurações
- `/analytics` - Relatórios
- `/contacts` - Gerenciar contatos

## 🔍 Verificações e Testes

### 1. Verificar Deploy

```bash
# Testar se a aplicação está online
curl https://seu-dominio.easypanel.host

# Testar webhook
curl https://seu-dominio.easypanel.host/api/rag/webhook
```

### 2. Testar Funcionalidades

1. **Login**: Crie conta e faça login
2. **Dashboard**: Visualize métricas
3. **Chat**: Teste envio de mensagens
4. **RAG**: Configure e teste IA
5. **Automação**: Configure regras

## 🚨 Troubleshooting

### Problemas Comuns

1. **Build Failed**:
   - Verificar dependências no `package.json`
   - Logs no painel Easypanel

2. **Environment Variables**:
   - Verificar se todas estão definidas
   - Valores corretos (URLs, chaves)

3. **Database Error**:
   - Verificar credenciais Supabase
   - Executar scripts SQL

4. **Webhook não funciona**:
   - URL correta na Evolution API
   - Testar endpoint manualmente

### Debug

```bash
# Ver logs no Easypanel
# Painel > Logs > Application Logs

# Testar endpoints
curl -X GET https://seu-dominio.easypanel.host/api/rag/webhook
curl -X POST https://seu-dominio.easypanel.host/api/rag/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'
```

## 🔄 Atualizações Futuras

### Deploy Automático

Qualquer push para a branch `main` vai fazer deploy automático:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

## 📋 Checklist Final

- [x] ✅ Código no GitHub
- [ ] 🔄 Deploy no Easypanel
- [ ] 🔧 Variáveis de ambiente
- [ ] 🌐 Domínio funcionando
- [ ] 🔐 Supabase configurado
- [ ] 🤖 OpenAI configurado
- [ ] 📱 Evolution API conectada
- [ ] 💬 WhatsApp funcionando
- [ ] 🧠 Base de conhecimento
- [ ] ⚡ Automação ativa

## 🆘 Suporte

- **Repositório**: [https://github.com/joaoterceiro/tiaen-chat](https://github.com/joaoterceiro/tiaen-chat)
- **Documentação**: README.md no repositório
- **Issues**: Crie issues no GitHub para problemas

---

## 🎯 Próximo Passo

**Agora é só fazer o deploy no Easypanel!**

1. Acesse seu painel Easypanel
2. Crie novo projeto com o repositório: `joaoterceiro/tiaen-chat`
3. Configure as variáveis de ambiente
4. Deploy! 🚀

O sistema está **100% pronto** para produção! 