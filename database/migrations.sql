-- ============================================================================
-- TIAEN CHAT - SCRIPTS DE MIGRAÇÃO E MANUTENÇÃO
-- ============================================================================
-- Scripts para manutenção, migração e otimização do banco de dados
-- ============================================================================

-- ============================================================================
-- SCRIPTS DE MANUTENÇÃO PERIÓDICA
-- ============================================================================

-- Limpeza de logs antigos (executar mensalmente)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Limpar logs de atividade com mais de 90 dias
    DELETE FROM public.activity_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Limpar execuções de automação com mais de 60 dias
    DELETE FROM public.automation_executions 
    WHERE executed_at < NOW() - INTERVAL '60 days';
    
    -- Limpar métricas horárias com mais de 30 dias
    DELETE FROM public.hourly_metrics 
    WHERE datetime < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Limpeza de logs concluída';
END;
$$;

-- Arquivar conversas antigas
CREATE OR REPLACE FUNCTION archive_old_conversations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Arquivar conversas resolvidas há mais de 30 dias
    UPDATE public.conversations 
    SET status = 'archived' 
    WHERE status = 'resolved' 
    AND last_message_at < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Arquivamento de conversas concluído';
END;
$$;

-- Calcular métricas diárias automaticamente
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Calcular métricas para ontem
    PERFORM calculate_daily_metrics(CURRENT_DATE - INTERVAL '1 day');
    
    -- Calcular métricas para hoje
    PERFORM calculate_daily_metrics(CURRENT_DATE);
    
    RAISE NOTICE 'Métricas diárias atualizadas';
END;
$$;

-- ============================================================================
-- SCRIPTS DE OTIMIZAÇÃO
-- ============================================================================

-- Reindexar tabelas principais
CREATE OR REPLACE FUNCTION reindex_tables()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Reindexar tabelas com mais uso
    REINDEX TABLE public.messages;
    REINDEX TABLE public.conversations;
    REINDEX TABLE public.contacts;
    REINDEX TABLE public.knowledge_base;
    
    RAISE NOTICE 'Reindexação concluída';
END;
$$;

-- Análise de estatísticas das tabelas
CREATE OR REPLACE FUNCTION analyze_tables()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    ANALYZE public.profiles;
    ANALYZE public.contacts;
    ANALYZE public.conversations;
    ANALYZE public.messages;
    ANALYZE public.knowledge_base;
    ANALYZE public.rag_queries;
    ANALYZE public.automation_rules;
    ANALYZE public.automation_executions;
    ANALYZE public.evolution_instances;
    ANALYZE public.daily_metrics;
    ANALYZE public.hourly_metrics;
    ANALYZE public.activity_logs;
    ANALYZE public.system_settings;
    ANALYZE public.ai_configurations;
    
    RAISE NOTICE 'Análise de estatísticas concluída';
END;
$$;

-- ============================================================================
-- SCRIPTS DE BACKUP
-- ============================================================================

-- Criar backup das configurações críticas
CREATE OR REPLACE FUNCTION backup_critical_settings()
RETURNS TABLE (
    backup_type text,
    data jsonb,
    created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'system_settings'::text,
        jsonb_agg(
            jsonb_build_object(
                'key', key,
                'value', value,
                'description', description,
                'is_public', is_public
            )
        ),
        NOW()
    FROM public.system_settings
    
    UNION ALL
    
    SELECT 
        'ai_configurations'::text,
        jsonb_agg(
            jsonb_build_object(
                'name', name,
                'provider', provider,
                'model', model,
                'temperature', temperature,
                'max_tokens', max_tokens,
                'system_prompt', system_prompt,
                'is_active', is_active
            )
        ),
        NOW()
    FROM public.ai_configurations
    WHERE is_active = true
    
    UNION ALL
    
    SELECT 
        'automation_rules'::text,
        jsonb_agg(
            jsonb_build_object(
                'name', name,
                'description', description,
                'trigger_type', trigger_type,
                'trigger_config', trigger_config,
                'action_type', action_type,
                'action_config', action_config,
                'is_active', is_active
            )
        ),
        NOW()
    FROM public.automation_rules
    WHERE is_active = true;
END;
$$;

-- ============================================================================
-- SCRIPTS DE MIGRAÇÃO
-- ============================================================================

-- Migração v1.1 - Adicionar campos de geolocalização
CREATE OR REPLACE FUNCTION migrate_v1_1()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Adicionar campos de localização aos contatos
    ALTER TABLE public.contacts 
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
    ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);
    
    -- Adicionar índice para busca por localização
    CREATE INDEX IF NOT EXISTS idx_contacts_location 
    ON public.contacts(latitude, longitude);
    
    RAISE NOTICE 'Migração v1.1 concluída - Campos de geolocalização adicionados';
END;
$$;

-- Migração v1.2 - Adicionar suporte a templates de mensagem
CREATE OR REPLACE FUNCTION migrate_v1_2()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Criar tabela de templates
    CREATE TABLE IF NOT EXISTS public.message_templates (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        variables JSONB DEFAULT '[]',
        category VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        usage_count INTEGER DEFAULT 0,
        created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Adicionar RLS
    ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
    
    -- Política para templates
    CREATE POLICY IF NOT EXISTS "Authenticated users can view templates" 
    ON public.message_templates FOR SELECT TO authenticated USING (is_active = true);
    
    -- Índices
    CREATE INDEX IF NOT EXISTS idx_message_templates_category 
    ON public.message_templates(category);
    
    CREATE INDEX IF NOT EXISTS idx_message_templates_is_active 
    ON public.message_templates(is_active);
    
    -- Trigger para updated_at
    CREATE TRIGGER IF NOT EXISTS update_message_templates_updated_at 
    BEFORE UPDATE ON public.message_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    RAISE NOTICE 'Migração v1.2 concluída - Templates de mensagem adicionados';
END;
$$;

-- Migração v1.3 - Adicionar sistema de etiquetas avançado
CREATE OR REPLACE FUNCTION migrate_v1_3()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Criar tabela de etiquetas
    CREATE TABLE IF NOT EXISTS public.tags (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
        description TEXT,
        is_system BOOLEAN DEFAULT FALSE,
        created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Criar tabela de relacionamento contato-etiqueta
    CREATE TABLE IF NOT EXISTS public.contact_tags (
        contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (contact_id, tag_id)
    );
    
    -- Habilitar RLS
    ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
    
    -- Políticas
    CREATE POLICY IF NOT EXISTS "Authenticated users can view tags" 
    ON public.tags FOR SELECT TO authenticated USING (true);
    
    CREATE POLICY IF NOT EXISTS "Authenticated users can view contact tags" 
    ON public.contact_tags FOR SELECT TO authenticated USING (true);
    
    -- Inserir etiquetas padrão
    INSERT INTO public.tags (name, color, description, is_system) VALUES
    ('Cliente', '#10B981', 'Cliente ativo', true),
    ('Prospect', '#F59E0B', 'Potencial cliente', true),
    ('VIP', '#8B5CF6', 'Cliente VIP', true),
    ('Suporte', '#EF4444', 'Necessita suporte', true),
    ('Lead', '#3B82F6', 'Lead qualificado', true)
    ON CONFLICT (name) DO NOTHING;
    
    RAISE NOTICE 'Migração v1.3 concluída - Sistema de etiquetas avançado adicionado';
END;
$$;

-- ============================================================================
-- SCRIPTS DE MONITORAMENTO
-- ============================================================================

-- Verificar saúde do banco
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
    metric text,
    value text,
    status text
)
LANGUAGE plpgsql
AS $$
DECLARE
    total_contacts integer;
    total_conversations integer;
    total_messages integer;
    active_conversations integer;
    avg_response_time numeric;
BEGIN
    -- Contar registros principais
    SELECT COUNT(*) INTO total_contacts FROM public.contacts;
    SELECT COUNT(*) INTO total_conversations FROM public.conversations;
    SELECT COUNT(*) INTO total_messages FROM public.messages;
    SELECT COUNT(*) INTO active_conversations FROM public.conversations WHERE status = 'active';
    
    -- Tempo médio de resposta
    SELECT AVG(average_response_time_seconds) INTO avg_response_time 
    FROM public.daily_metrics 
    WHERE date >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Retornar métricas
    RETURN QUERY VALUES
    ('Total de Contatos', total_contacts::text, 
     CASE WHEN total_contacts > 0 THEN 'OK' ELSE 'ATENÇÃO' END),
    ('Total de Conversas', total_conversations::text, 
     CASE WHEN total_conversations > 0 THEN 'OK' ELSE 'ATENÇÃO' END),
    ('Total de Mensagens', total_messages::text, 
     CASE WHEN total_messages > 0 THEN 'OK' ELSE 'ATENÇÃO' END),
    ('Conversas Ativas', active_conversations::text, 
     CASE WHEN active_conversations >= 0 THEN 'OK' ELSE 'ERRO' END),
    ('Tempo Médio de Resposta (7 dias)', COALESCE(avg_response_time::text, 'N/A'), 
     CASE WHEN avg_response_time IS NOT NULL AND avg_response_time < 300 THEN 'OK' 
          WHEN avg_response_time IS NOT NULL THEN 'ATENÇÃO' 
          ELSE 'N/A' END);
END;
$$;

-- Relatório de uso de recursos
CREATE OR REPLACE FUNCTION resource_usage_report()
RETURNS TABLE (
    table_name text,
    row_count bigint,
    size_mb numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins - n_tup_del as row_count,
        ROUND((pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0)::numeric, 2) as size_mb
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$;

-- ============================================================================
-- SCRIPTS DE SEGURANÇA
-- ============================================================================

-- Auditoria de acessos
CREATE OR REPLACE FUNCTION audit_user_access()
RETURNS TABLE (
    user_id uuid,
    email text,
    last_login timestamptz,
    activity_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.updated_at,
        COUNT(al.id) as activity_count
    FROM public.profiles p
    LEFT JOIN public.activity_logs al ON p.id = al.user_id
    WHERE al.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.email, p.updated_at
    ORDER BY activity_count DESC;
END;
$$;

-- Verificar políticas RLS
CREATE OR REPLACE FUNCTION check_rls_policies()
RETURNS TABLE (
    table_name text,
    rls_enabled boolean,
    policy_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        t.rowsecurity,
        COUNT(p.policyname) as policy_count
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename
    WHERE t.schemaname = 'public'
    GROUP BY t.tablename, t.rowsecurity
    ORDER BY t.tablename;
END;
$$;

-- ============================================================================
-- AGENDAMENTO DE TAREFAS (CRON JOBS)
-- ============================================================================

-- Configurar cron jobs (requer extensão pg_cron)
-- SELECT cron.schedule('cleanup-logs', '0 2 * * 0', 'SELECT cleanup_old_logs();');
-- SELECT cron.schedule('archive-conversations', '0 3 * * 0', 'SELECT archive_old_conversations();');
-- SELECT cron.schedule('update-metrics', '0 1 * * *', 'SELECT update_daily_metrics();');
-- SELECT cron.schedule('analyze-tables', '0 4 * * 0', 'SELECT analyze_tables();');

-- ============================================================================
-- COMANDOS ÚTEIS PARA ADMINISTRAÇÃO
-- ============================================================================

-- Verificar tamanho das tabelas
-- SELECT 
--     schemaname,
--     tablename,
--     attname,
--     n_distinct,
--     most_common_vals
-- FROM pg_stats 
-- WHERE schemaname = 'public'
-- ORDER BY schemaname, tablename;

-- Verificar índices não utilizados
-- SELECT 
--     schemaname,
--     tablename,
--     attname,
--     n_distinct,
--     most_common_vals
-- FROM pg_stat_user_indexes 
-- WHERE idx_scan = 0
-- ORDER BY schemaname, tablename;

-- Verificar queries lentas
-- SELECT 
--     query,
--     calls,
--     total_time,
--     mean_time,
--     rows
-- FROM pg_stat_statements 
-- ORDER BY mean_time DESC 
-- LIMIT 10;

-- ============================================================================
-- FIM DOS SCRIPTS DE MIGRAÇÃO E MANUTENÇÃO
-- ============================================================================ 