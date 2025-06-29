# 🔧 Configuração do Supabase - Tiaen Chat

## ⚠️ PROBLEMA: Dados não estão salvando

**CAUSA**: As variáveis de ambiente do Supabase não estão configuradas, por isso os dados não persistem.

## ✅ SOLUÇÃO RÁPIDA

### Passo 1: Criar arquivo .env.local
```bash
# Na raiz do projeto, crie o arquivo .env.local
cp env.example .env.local
```

### Passo 2: Configurar Supabase

#### 2.1 Criar projeto no Supabase
1. Acesse: https://supabase.com/
2. Clique em "New Project"
3. Preencha:
   - **Nome**: `tiaen-chat`
   - **Senha DB**: `suasenhaforte123` (anote esta senha!)
   - **Região**: South America (São Paulo)
4. Aguarde 2-3 minutos para criação

#### 2.2 Obter credenciais
1. Vá para **Settings** → **API**
2. Copie:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 2.3 Configurar .env.local
```env
# Cole suas credenciais aqui
NEXT_PUBLIC_SUPABASE_URL=https://seu-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### Passo 3: Configurar Banco de Dados

#### 3.1 Executar SQL Schema
1. No Supabase, vá para **SQL Editor**
2. Copie e execute o conteúdo de: `database/supabase-schema.sql`
3. Aguarde a execução (pode levar 1-2 minutos)

#### 3.2 Inserir dados de exemplo
1. No **SQL Editor**, execute: `database/sample-data.sql`
2. Isso criará dados de teste para verificar se está funcionando

### Passo 4: Configurar Autenticação
1. Vá para **Authentication** → **Settings**
2. Em **Site URL**: `http://localhost:3000`
3. Em **Redirect URLs**, adicione:
   ```
   http://localhost:3000/auth/callback
   ```

### Passo 5: Testar
```bash
# Reiniciar o servidor
npm run dev

# Acessar: http://localhost:3000
# Fazer login/cadastro
# Ir para Dashboard - deve mostrar dados!
```

## 🧪 Como Verificar se Está Funcionando

### Teste 1: Dashboard com Dados
- Acesse `/dashboard`
- Deve mostrar métricas (não zeros)
- Se aparecer dados, está funcionando!

### Teste 2: Persistência
- Vá para `/rag` → Base de Conhecimento
- Adicione um novo conhecimento
- Recarregue a página
- Se o conhecimento persistir, está funcionando!

### Teste 3: Console do Navegador
- Abra DevTools (F12)
- Vá para Console
- Não deve ter erros de Supabase

## 🚨 Erros Comuns

### "Failed to fetch"
**Problema**: Credenciais incorretas ou projeto pausado
**Solução**: 
1. Verifique se copiou as credenciais corretas
2. Confirme se o projeto Supabase está ativo

### "Invalid API key"
**Problema**: Chave anon incorreta
**Solução**: 
1. Vá para Settings → API no Supabase
2. Copie novamente a chave **anon public**

### "CORS error"
**Problema**: URLs de redirecionamento
**Solução**:
1. Authentication → Settings
2. Adicione `http://localhost:3000/auth/callback`

### "RLS policy violation"
**Problema**: Políticas de segurança
**Solução**: 
1. Execute novamente o `supabase-schema.sql`
2. Confirme que as políticas RLS foram criadas

## 📋 Checklist de Configuração

- [ ] Projeto Supabase criado
- [ ] Arquivo `.env.local` criado com credenciais
- [ ] Schema SQL executado (`supabase-schema.sql`)
- [ ] Dados de exemplo inseridos (`sample-data.sql`)
- [ ] URLs de autenticação configuradas
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Login funcionando
- [ ] Dashboard mostrando dados
- [ ] Base de conhecimento persistindo

## 🎯 Resultado Esperado

Após seguir todos os passos:

1. **Login/Cadastro**: Funcionando normalmente
2. **Dashboard**: Mostrando métricas reais (não zeros)
3. **Contatos**: Lista de contatos carregando
4. **Base de Conhecimento**: Adição/edição/exclusão funcionando
5. **Analytics**: Gráficos com dados
6. **Configurações**: Salvando OpenAI/Evolution

## 💡 Dicas Importantes

1. **Nunca commite o .env.local** (já está no .gitignore)
2. **Anote a senha do banco** para futuras configurações
3. **Mantenha o projeto Supabase ativo** (plano gratuito pausa após inatividade)
4. **Para produção**, configure as URLs corretas no Supabase

## 🆘 Ainda não funciona?

1. **Verifique o console** (F12) para erros específicos
2. **Teste a conexão** diretamente no SQL Editor do Supabase
3. **Confirme as credenciais** copiando novamente do Supabase
4. **Reinicie o servidor** após alterar .env.local

---

**✅ Após seguir este guia, o sistema deve persistir todos os dados corretamente!** 