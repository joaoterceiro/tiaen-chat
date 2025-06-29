# Sistema RAG de Atendimento WhatsApp

## 🤖 Visão Geral

Sistema completo de atendimento automatizado via WhatsApp utilizando tecnologia RAG (Retrieval-Augmented Generation) com integração OpenAI e Evolution API.

## 🚀 Funcionalidades

### ✅ Core Features
- **Chat Interface**: Interface moderna para conversas em tempo real
- **Sistema RAG**: Respostas inteligentes baseadas em base de conhecimento
- **Base de Conhecimento**: Gerenciamento completo de conteúdo
- **Automação**: Regras customizáveis para respostas automáticas
- **Analytics**: Métricas e relatórios detalhados
- **Multi-instância**: Suporte a múltiplas conexões WhatsApp

### 🔧 Integrações
- **OpenAI API**: GPT-3.5/4 para geração de respostas
- **Evolution API**: Conexão com WhatsApp Business
- **Webhooks**: Recebimento de mensagens em tempo real
- **Embeddings**: Busca semântica na base de conhecimento

## 📋 Pré-requisitos

### APIs Necessárias
1. **OpenAI API Key**
   - Acesse: https://platform.openai.com/api-keys
   - Crie uma nova API key
   - Tenha créditos disponíveis

2. **Evolution API**
   - Deploy próprio ou serviço terceirizado
   - URL base da API
   - API Key de autenticação

### Dependências
```bash
npm install openai axios socket.io-client recharts date-fns
```

## ⚙️ Configuração

### 1. Configuração Inicial
Acesse `/rag` e configure:

#### OpenAI
- **API Key**: Sua chave da OpenAI
- **Modelo**: gpt-3.5-turbo ou gpt-4
- **Temperatura**: 0.7 (criatividade)
- **Max Tokens**: 1000
- **System Prompt**: Personalização do comportamento

#### Evolution API
- **URL Base**: https://sua-evolution-api.com
- **API Key**: Chave de autenticação
- **Webhook URL**: Para receber mensagens

### 2. Criação de Instância
1. Vá para o painel "Instâncias"
2. Clique em "Nova"
3. Digite um nome único
4. Conecte escaneando o QR Code

### 3. Base de Conhecimento
1. Acesse a aba "Base"
2. Adicione conteúdos por categoria
3. Use tags para organização
4. Ative/desative conforme necessário

## 🏗️ Arquitetura

### Estrutura de Arquivos
```
src/
├── app/rag/                 # Página principal
├── components/rag/          # Componentes específicos
│   ├── ConversationsPanel.tsx
│   ├── ChatInterface.tsx
│   ├── ConfigurationPanel.tsx
│   ├── KnowledgeBasePanel.tsx
│   ├── InstancesPanel.tsx
│   ├── AutomationPanel.tsx
│   └── AnalyticsPanel.tsx
├── contexts/RAGContext.tsx  # Estado global
├── services/                # Integrações APIs
│   ├── openai.ts
│   └── evolution.ts
├── types/rag.ts            # Tipos TypeScript
└── api/rag/webhook/        # Endpoint webhook
```

### Fluxo de Dados
```
WhatsApp → Evolution API → Webhook → RAG System → OpenAI → Response
```

## 🔄 Como Usar

### 1. Atendimento Manual
- Selecione uma conversa
- Digite respostas diretamente
- Use o modo "Manual"

### 2. Modo RAG
- Ative o "RAG Mode"
- Digite contexto ou pergunta
- Sistema busca conhecimento relevante
- Gera resposta automaticamente

### 3. Automação
- Crie regras baseadas em:
  - Palavras-chave
  - Tempo de resposta
  - Sentimento
  - Primeira mensagem
- Defina ações automáticas

## 📊 Analytics

### Métricas Disponíveis
- **Volume de conversas**
- **Tempo médio de resposta**
- **Taxa de satisfação**
- **Performance por agente**
- **Categorias mais consultadas**

### Relatórios
- Gráficos de linha temporal
- Distribuição por status
- Top categorias da base
- Performance dos agentes

## 🔧 Personalização

### System Prompt
Personalize o comportamento da IA:
```
Você é um assistente virtual para [EMPRESA].
Seja sempre educado, prestativo e profissional.
Use as informações da base de conhecimento.
Se não souber, transfira para um humano.
```

### Regras de Automação
Exemplos de configuração:

#### Saudação Automática
- **Gatilho**: primeira_mensagem
- **Ação**: send_message
- **Valor**: "Olá! Como posso ajudar?"

#### Palavras-chave
- **Gatilho**: keyword
- **Valor**: "preço, valor, custo"
- **Ação**: send_message
- **Valor**: "Vou buscar informações sobre preços..."

## 🚨 Troubleshooting

### Problemas Comuns

#### Instância não conecta
- Verifique URL da Evolution API
- Confirme API Key válida
- Teste conectividade de rede

#### QR Code não aparece
- Aguarde alguns segundos
- Refresh da página
- Verifique logs do console

#### Respostas RAG inadequadas
- Revise base de conhecimento
- Ajuste system prompt
- Verifique temperatura do modelo

#### Webhook não funciona
- URL deve ser HTTPS
- Endpoint deve estar acessível
- Verifique logs de erro

### Logs e Debug
```javascript
// Habilitar logs detalhados
localStorage.setItem('rag-debug', 'true')
```

## 🔐 Segurança

### Boas Práticas
- Use HTTPS sempre
- Mantenha API keys seguras
- Implemente rate limiting
- Monitore uso de tokens
- Backup da base de conhecimento

### Variáveis de Ambiente
```env
OPENAI_API_KEY=sk-...
EVOLUTION_API_URL=https://...
EVOLUTION_API_KEY=...
WEBHOOK_SECRET=...
```

## 📈 Performance

### Otimizações
- Cache de embeddings
- Limitação de tokens
- Batch processing
- Lazy loading de componentes

### Monitoramento
- Tempo de resposta da API
- Uso de tokens OpenAI
- Taxa de erro
- Satisfação do cliente

## 🔄 Atualizações

### Roadmap
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com CRM
- [ ] Analytics avançados
- [ ] Treinamento personalizado
- [ ] API para terceiros

### Changelog
- **v1.0.0**: Versão inicial
  - Sistema RAG básico
  - Interface de chat
  - Base de conhecimento
  - Automação simples
  - Analytics básicos

## 🤝 Contribuição

### Como Contribuir
1. Fork do repositório
2. Crie uma branch feature
3. Faça as alterações
4. Teste completamente
5. Abra um Pull Request

### Padrões de Código
- TypeScript strict mode
- ESLint + Prettier
- Componentes funcionais
- Hooks customizados
- Testes unitários

## 📞 Suporte

### Documentação
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Evolution API Docs](https://doc.evolution-api.com/)
- [Next.js Docs](https://nextjs.org/docs)

### Comunidade
- Discord: [Link]
- GitHub Issues: [Link]
- Email: suporte@exemplo.com

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e Tailwind CSS** 