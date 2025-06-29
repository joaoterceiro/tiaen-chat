# Tiaen Chat - Sistema de Chat WhatsApp com IA

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Evolution API](https://img.shields.io/badge/Evolution-API-orange)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-purple)

Sistema completo de chat WhatsApp com inteligência artificial, sistema RAG (Retrieval-Augmented Generation) e automação de atendimento.

## 🚀 Funcionalidades

### 💬 Chat WhatsApp
- Interface de chat em tempo real similar ao WhatsApp
- Envio e recebimento de mensagens automático
- Status de mensagens (enviado, entregue, lido)
- Suporte a múltiplas conversas simultâneas
- Criação automática de contatos e conversas

### 🤖 Inteligência Artificial
- **Sistema RAG**: Respostas baseadas em base de conhecimento
- **OpenAI Integration**: GPT-3.5/GPT-4 para geração de respostas
- **Modo Manual/Automático**: Toggle entre IA e atendimento humano
- **Análise de Sentimento**: Classificação automática de conversas
- **Resposta Contextual**: Considera histórico da conversa

### 🔧 Automação
- **Regras de Automação**: Respostas baseadas em palavras-chave
- **Saudação Automática**: Mensagem de boas-vindas para novos contatos
- **Horário Comercial**: Respostas automáticas fora do expediente
- **Transferência Inteligente**: Escalação para agentes humanos
- **Webhooks**: Processamento em tempo real

### 📊 Dashboard e Analytics
- **Métricas em Tempo Real**: Conversas, mensagens, contatos
- **Gráficos Interativos**: Visualização de dados de atendimento
- **Relatórios**: Análise de performance e tendências
- **Filtros Avançados**: Por status, prioridade, período
- **Exportação de Dados**: Relatórios em CSV/PDF

### 🎨 Interface Moderna
- **Design Responsivo**: Mobile-first, adaptável a todos os dispositivos
- **Tema Customizável**: Cores e layout personalizáveis
- **UX Otimizada**: Interface intuitiva e fácil de usar
- **Componentes Reutilizáveis**: Sistema de design consistente
- **Acessibilidade**: Suporte a leitores de tela e navegação por teclado

## 🛠️ Tecnologias

### Frontend
- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Framework CSS utilitário
- **Radix UI**: Componentes acessíveis e customizáveis
- **Recharts**: Gráficos e visualizações interativas

### Backend
- **Supabase**: Database PostgreSQL com Auth
- **Evolution API**: Integração com WhatsApp Business
- **OpenAI API**: Processamento de linguagem natural
- **Webhooks**: Comunicação em tempo real
- **Edge Functions**: Serverless computing

### Infraestrutura
- **Vercel/Easypanel**: Deploy e hosting
- **PostgreSQL**: Banco de dados relacional
- **Redis**: Cache e sessões (opcional)
- **Docker**: Containerização para deploy

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta OpenAI
- Servidor Evolution API

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/tiaen-chat.git
cd tiaen-chat
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# Evolution API Configuration
NEXT_PUBLIC_EVOLUTION_API_URL=http://localhost:8080
NEXT_PUBLIC_EVOLUTION_API_KEY=sua-chave-evolution
NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL=https://seu-dominio.com/api/rag/webhook

# OpenAI Configuration
OPENAI_API_KEY=sua-chave-openai

# Application Configuration
NEXTAUTH_SECRET=sua-chave-secreta
NEXTAUTH_URL=https://seu-dominio.com
```

### 4. Configurar Banco de Dados
Execute os scripts SQL na pasta `database/`:

```bash
# No Supabase SQL Editor
1. Execute: database/supabase-schema.sql
2. Execute: database/migrations.sql
3. Execute: database/sample-data.sql (opcional)
```

### 5. Executar Localmente
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📦 Deploy no Easypanel

### 1. Preparar Projeto para Deploy
```bash
# Build do projeto
npm run build

# Verificar se build está funcionando
npm start
```

### 2. Configurar Easypanel

1. **Criar Novo Projeto**:
   - Acesse seu painel Easypanel
   - Clique em "New Project"
   - Selecione "GitHub Repository"

2. **Conectar Repositório**:
   - Conecte sua conta GitHub
   - Selecione o repositório `tiaen-chat`
   - Branch: `main`

3. **Configurar Build**:
   ```yaml
   # Build Command
   npm install && npm run build
   
   # Start Command
   npm start
   
   # Port
   3000
   ```

4. **Variáveis de Ambiente**:
   - Adicione todas as variáveis do `.env.local`
   - Configure URLs de produção
   - Defina `NODE_ENV=production`

### 3. Configurar Domínio
- Configure seu domínio personalizado
- Ative SSL/TLS automático
- Configure redirects se necessário

### 4. Configurar Webhook
Após deploy, configure o webhook da Evolution API:
```
https://seu-dominio.com/api/rag/webhook
```

## 🔧 Configuração Pós-Deploy

### 1. Configurar Sistema RAG
1. Acesse: `https://seu-dominio.com/rag`
2. Configure OpenAI API
3. Configure Evolution API
4. Crie instância WhatsApp
5. Adicione base de conhecimento

### 2. Configurar Automação
1. Acesse painel de automação
2. Crie regras de resposta automática
3. Configure horários de atendimento
4. Teste fluxos de conversa

### 3. Importar Dados
1. Importe contatos existentes
2. Configure templates de mensagem
3. Defina agentes e permissões

## 📁 Estrutura do Projeto

```
tiaen-chat/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Autenticação
│   │   ├── conversas/         # Página de Chat
│   │   ├── dashboard/         # Dashboard
│   │   └── rag/               # Sistema RAG
│   ├── components/            # Componentes React
│   │   ├── auth/              # Componentes de autenticação
│   │   ├── dashboard/         # Componentes do dashboard
│   │   ├── layout/            # Layout e navegação
│   │   ├── rag/               # Componentes RAG
│   │   └── ui/                # Componentes base
│   ├── contexts/              # Context API
│   ├── lib/                   # Utilitários
│   ├── services/              # Serviços externos
│   └── types/                 # Tipos TypeScript
├── database/                  # Scripts SQL
├── public/                    # Arquivos estáticos
└── docs/                      # Documentação
```

## 🔐 Segurança

- **Autenticação**: Supabase Auth com RLS
- **Autorização**: Row Level Security
- **API Keys**: Criptografia de chaves sensíveis
- **Webhooks**: Validação de origem
- **CORS**: Configuração restritiva
- **Rate Limiting**: Proteção contra spam

## 📊 Monitoramento

### Logs
- Logs de aplicação via console
- Logs de webhook para debug
- Logs de Evolution API
- Logs de OpenAI

### Métricas
- Uptime e performance
- Uso de API (OpenAI, Evolution)
- Métricas de conversa
- Análise de sentimento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Documentação**: [Docs completa](./docs/)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/tiaen-chat/issues)
- **Discord**: [Comunidade](https://discord.gg/seu-servidor)
- **Email**: suporte@tiaen.com

## 🚀 Roadmap

### Versão 1.1
- [ ] Suporte a grupos WhatsApp
- [ ] Templates de mensagem
- [ ] Agendamento de mensagens
- [ ] Múltiplas instâncias

### Versão 1.2
- [ ] Integração com CRM
- [ ] API pública
- [ ] Webhooks customizáveis
- [ ] Relatórios avançados

### Versão 2.0
- [ ] Multi-tenancy
- [ ] Marketplace de integrações
- [ ] IA personalizada por cliente
- [ ] Análise de voz

## 🎯 Casos de Uso

- **E-commerce**: Atendimento automatizado de vendas
- **Suporte Técnico**: Resolução de problemas via IA
- **Educação**: Tutoria e suporte a alunos
- **Saúde**: Triagem e agendamento de consultas
- **Financeiro**: Atendimento bancário automatizado

---

**Desenvolvido com ❤️ por [Seu Nome](https://github.com/seu-usuario)** 