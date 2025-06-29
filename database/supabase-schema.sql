-- ============================================================================
-- TIAEN CHAT - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Sistema de chat WhatsApp com IA e RAG
-- Versão: 1.0
-- Data: 2024
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- TABELAS DE USUÁRIOS E AUTENTICAÇÃO
-- ============================================================================

-- Perfis de usuários (estende auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'agent', 'user')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE CONTATOS E CONVERSAS
-- ============================================================================

-- Contatos do WhatsApp
CREATE TABLE public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    last_seen TIMESTAMPTZ,
    is_online BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversas
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'pending', 'archived')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    tags TEXT[] DEFAULT '{}',
    summary TEXT,
    sentiment VARCHAR(10) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens do WhatsApp
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    whatsapp_id VARCHAR(255) UNIQUE,
    from_phone VARCHAR(20) NOT NULL,
    to_phone VARCHAR(20) NOT NULL,
    body TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'location', 'contact')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    is_from_bot BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE CONHECIMENTO E RAG
-- ============================================================================

-- Base de conhecimento
CREATE TABLE public.knowledge_base (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    embedding VECTOR(1536), -- OpenAI embeddings dimension
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de consultas RAG
CREATE TABLE public.rag_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    confidence DECIMAL(3,2),
    sources JSONB DEFAULT '[]',
    reasoning TEXT,
    suggested_actions TEXT[],
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE AUTOMAÇÃO
-- ============================================================================

-- Regras de automação
CREATE TABLE public.automation_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('keyword', 'time', 'sentiment', 'first_message', 'schedule')),
    trigger_config JSONB NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('send_message', 'transfer_agent', 'add_tag', 'create_ticket', 'webhook')),
    action_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de execuções de automação
CREATE TABLE public.automation_executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    trigger_data JSONB,
    action_data JSONB,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'skipped')),
    error_message TEXT,
    execution_time_ms INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE INSTÂNCIAS EVOLUTION API
-- ============================================================================

-- Instâncias do Evolution API
CREATE TABLE public.evolution_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error')),
    qr_code TEXT,
    phone VARCHAR(20),
    profile_picture TEXT,
    webhook_url TEXT,
    api_key VARCHAR(255),
    settings JSONB DEFAULT '{}',
    last_connection TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE ANALYTICS E MÉTRICAS
-- ============================================================================

-- Métricas diárias
CREATE TABLE public.daily_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    total_conversations INTEGER DEFAULT 0,
    active_conversations INTEGER DEFAULT 0,
    resolved_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    bot_messages INTEGER DEFAULT 0,
    human_messages INTEGER DEFAULT 0,
    average_response_time_seconds INTEGER DEFAULT 0,
    customer_satisfaction DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Métricas por hora
CREATE TABLE public.hourly_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    datetime TIMESTAMPTZ NOT NULL,
    messages_count INTEGER DEFAULT 0,
    conversations_count INTEGER DEFAULT 0,
    bot_responses INTEGER DEFAULT 0,
    average_response_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(datetime)
);

-- ============================================================================
-- TABELAS DE ATIVIDADES E LOGS
-- ============================================================================

-- Log de atividades do sistema
CREATE TABLE public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE CONFIGURAÇÕES
-- ============================================================================

-- Configurações globais do sistema
CREATE TABLE public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações de IA e OpenAI
CREATE TABLE public.ai_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) DEFAULT 'openai' CHECK (provider IN ('openai', 'anthropic', 'google')),
    model VARCHAR(100) NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    system_prompt TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para contacts
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);

-- Índices para conversations
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_assigned_agent ON public.conversations(assigned_agent_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);

-- Índices para messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX idx_messages_from_phone ON public.messages(from_phone);
CREATE INDEX idx_messages_whatsapp_id ON public.messages(whatsapp_id);

-- Índices para knowledge_base
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX idx_knowledge_base_is_active ON public.knowledge_base(is_active);
CREATE INDEX idx_knowledge_base_tags ON public.knowledge_base USING GIN(tags);
CREATE INDEX idx_knowledge_base_embedding ON public.knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Índices para automation
CREATE INDEX idx_automation_rules_is_active ON public.automation_rules(is_active);
CREATE INDEX idx_automation_rules_trigger_type ON public.automation_rules(trigger_type);
CREATE INDEX idx_automation_executions_rule_id ON public.automation_executions(rule_id);
CREATE INDEX idx_automation_executions_executed_at ON public.automation_executions(executed_at);

-- Índices para metrics
CREATE INDEX idx_daily_metrics_date ON public.daily_metrics(date);
CREATE INDEX idx_hourly_metrics_datetime ON public.hourly_metrics(datetime);

-- Índices para activity_logs
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evolution_instances_updated_at BEFORE UPDATE ON public.evolution_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_configurations_updated_at BEFORE UPDATE ON public.ai_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hourly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para contacts (usuários autenticados podem ver todos)
CREATE POLICY "Authenticated users can view contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (true);

-- Políticas para conversations
CREATE POLICY "Authenticated users can view conversations" ON public.conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update conversations" ON public.conversations FOR UPDATE TO authenticated USING (true);

-- Políticas para messages
CREATE POLICY "Authenticated users can view messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas para knowledge_base
CREATE POLICY "Authenticated users can view active knowledge" ON public.knowledge_base FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Authenticated users can insert knowledge" ON public.knowledge_base FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update knowledge" ON public.knowledge_base FOR UPDATE TO authenticated USING (true);

-- Políticas para automation
CREATE POLICY "Authenticated users can view automation rules" ON public.automation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert automation rules" ON public.automation_rules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update automation rules" ON public.automation_rules FOR UPDATE TO authenticated USING (true);

-- Políticas para metrics (somente leitura)
CREATE POLICY "Authenticated users can view metrics" ON public.daily_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view hourly metrics" ON public.hourly_metrics FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função para buscar conhecimento similar
CREATE OR REPLACE FUNCTION search_knowledge(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id uuid,
    title varchar,
    content text,
    category varchar,
    tags text[],
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.tags,
        1 - (kb.embedding <=> query_embedding) as similarity
    FROM public.knowledge_base kb
    WHERE kb.is_active = true
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Função para calcular métricas diárias
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date date)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    total_conv integer;
    active_conv integer;
    resolved_conv integer;
    total_msg integer;
    bot_msg integer;
    human_msg integer;
    avg_response_time integer;
BEGIN
    -- Calcular métricas
    SELECT COUNT(*) INTO total_conv
    FROM public.conversations
    WHERE DATE(created_at) = target_date;
    
    SELECT COUNT(*) INTO active_conv
    FROM public.conversations
    WHERE status = 'active' AND DATE(created_at) = target_date;
    
    SELECT COUNT(*) INTO resolved_conv
    FROM public.conversations
    WHERE status = 'resolved' AND DATE(created_at) = target_date;
    
    SELECT COUNT(*) INTO total_msg
    FROM public.messages
    WHERE DATE(timestamp) = target_date;
    
    SELECT COUNT(*) INTO bot_msg
    FROM public.messages
    WHERE is_from_bot = true AND DATE(timestamp) = target_date;
    
    SELECT COUNT(*) INTO human_msg
    FROM public.messages
    WHERE is_from_bot = false AND DATE(timestamp) = target_date;
    
    -- Inserir ou atualizar métricas
    INSERT INTO public.daily_metrics (
        date, total_conversations, active_conversations, resolved_conversations,
        total_messages, bot_messages, human_messages, average_response_time_seconds
    )
    VALUES (
        target_date, total_conv, active_conv, resolved_conv,
        total_msg, bot_msg, human_msg, 0
    )
    ON CONFLICT (date) DO UPDATE SET
        total_conversations = EXCLUDED.total_conversations,
        active_conversations = EXCLUDED.active_conversations,
        resolved_conversations = EXCLUDED.resolved_conversations,
        total_messages = EXCLUDED.total_messages,
        bot_messages = EXCLUDED.bot_messages,
        human_messages = EXCLUDED.human_messages;
END;
$$;

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Configurações iniciais do sistema
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
('app_name', '"Tiaen Chat"', 'Nome da aplicação', true),
('app_version', '"1.0.0"', 'Versão da aplicação', true),
('default_language', '"pt-BR"', 'Idioma padrão', true),
('timezone', '"America/Sao_Paulo"', 'Fuso horário padrão', true),
('max_file_size', '10485760', 'Tamanho máximo de arquivo em bytes (10MB)', false),
('auto_archive_days', '30', 'Dias para arquivar conversas automaticamente', false);

-- Configuração inicial de IA
INSERT INTO public.ai_configurations (name, provider, model, api_key_encrypted, system_prompt, is_active) VALUES
('Default OpenAI', 'openai', 'gpt-3.5-turbo', 'ENCRYPTED_KEY_PLACEHOLDER', 
'Você é um assistente virtual especializado em atendimento ao cliente via WhatsApp. Seja sempre educado, prestativo e objetivo nas suas respostas.', 
true);

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuários que estendem a tabela auth.users do Supabase';
COMMENT ON TABLE public.contacts IS 'Contatos do WhatsApp com informações de perfil';
COMMENT ON TABLE public.conversations IS 'Conversas agrupadas por contato';
COMMENT ON TABLE public.messages IS 'Mensagens individuais do WhatsApp';
COMMENT ON TABLE public.knowledge_base IS 'Base de conhecimento para o sistema RAG';
COMMENT ON TABLE public.rag_queries IS 'Histórico de consultas e respostas do RAG';
COMMENT ON TABLE public.automation_rules IS 'Regras de automação configuráveis';
COMMENT ON TABLE public.automation_executions IS 'Log de execuções das automações';
COMMENT ON TABLE public.evolution_instances IS 'Instâncias do Evolution API';
COMMENT ON TABLE public.daily_metrics IS 'Métricas agregadas por dia';
COMMENT ON TABLE public.hourly_metrics IS 'Métricas agregadas por hora';
COMMENT ON TABLE public.activity_logs IS 'Log de atividades do sistema';
COMMENT ON TABLE public.system_settings IS 'Configurações globais do sistema';
COMMENT ON TABLE public.ai_configurations IS 'Configurações de IA e modelos';

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================