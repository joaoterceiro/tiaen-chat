-- ============================================================================
-- TIAEN CHAT - DADOS DE EXEMPLO PARA TESTES
-- ============================================================================
-- Execute este arquivo APÓS o schema principal para popular o banco com dados de teste
-- ============================================================================

-- ============================================================================
-- CONTATOS DE EXEMPLO
-- ============================================================================

INSERT INTO public.contacts (phone, name, profile_picture, is_online, tags, notes) VALUES
('5511999887766', 'João Silva', 'https://avatar.iran.liara.run/public/1', true, ARRAY['cliente', 'vip'], 'Cliente premium desde 2023'),
('5511888776655', 'Maria Santos', 'https://avatar.iran.liara.run/public/2', false, ARRAY['prospect'], 'Interessada em nossos serviços'),
('5511777665544', 'Pedro Oliveira', 'https://avatar.iran.liara.run/public/3', true, ARRAY['suporte'], 'Cliente com questões técnicas'),
('5511666554433', 'Ana Costa', 'https://avatar.iran.liara.run/public/4', false, ARRAY['cliente'], 'Comprou recentemente'),
('5511555443322', 'Carlos Lima', 'https://avatar.iran.liara.run/public/5', true, ARRAY['lead'], 'Demonstrou interesse no produto'),
('5511444332211', 'Lucia Ferreira', 'https://avatar.iran.liara.run/public/6', false, ARRAY['cliente', 'recorrente'], 'Cliente fiel há 2 anos'),
('5511333221100', 'Roberto Souza', 'https://avatar.iran.liara.run/public/7', true, ARRAY['vip'], 'Alto valor de compra'),
('5511222110099', 'Fernanda Alves', 'https://avatar.iran.liara.run/public/8', false, ARRAY['prospect'], 'Aguardando proposta');

-- ============================================================================
-- CONVERSAS DE EXEMPLO
-- ============================================================================

INSERT INTO public.conversations (contact_id, status, priority, tags, summary, sentiment, last_message_at) 
SELECT 
    c.id,
    CASE 
        WHEN c.name IN ('João Silva', 'Pedro Oliveira') THEN 'active'
        WHEN c.name IN ('Maria Santos', 'Ana Costa') THEN 'resolved'
        ELSE 'pending'
    END,
    CASE 
        WHEN 'vip' = ANY(c.tags) THEN 'high'
        WHEN 'suporte' = ANY(c.tags) THEN 'urgent'
        ELSE 'medium'
    END,
    ARRAY['whatsapp', 'atendimento'],
    CASE 
        WHEN c.name = 'João Silva' THEN 'Cliente perguntando sobre novos produtos'
        WHEN c.name = 'Pedro Oliveira' THEN 'Problema técnico com instalação'
        WHEN c.name = 'Maria Santos' THEN 'Solicitação de orçamento resolvida'
        ELSE 'Conversa inicial de contato'
    END,
    CASE 
        WHEN c.name IN ('João Silva', 'Ana Costa') THEN 'positive'
        WHEN c.name = 'Pedro Oliveira' THEN 'negative'
        ELSE 'neutral'
    END,
    NOW() - (RANDOM() * INTERVAL '7 days')
FROM public.contacts c;

-- ============================================================================
-- MENSAGENS DE EXEMPLO
-- ============================================================================

-- Mensagens para João Silva (conversa ativa positiva)
INSERT INTO public.messages (conversation_id, from_phone, to_phone, body, is_from_bot, timestamp) 
SELECT 
    conv.id,
    '5511999887766',
    '5511000000000',
    'Olá! Gostaria de saber sobre os novos produtos que vocês lançaram.',
    false,
    NOW() - INTERVAL '2 hours'
FROM public.conversations conv
JOIN public.contacts c ON conv.contact_id = c.id
WHERE c.name = 'João Silva';

INSERT INTO public.messages (conversation_id, from_phone, to_phone, body, is_from_bot, timestamp) 
SELECT 
    conv.id,
    '5511000000000',
    '5511999887766',
    'Olá João! Ficamos felizes com seu interesse. Acabamos de lançar nossa nova linha premium. Gostaria que eu envie o catálogo completo?',
    true,
    NOW() - INTERVAL '1 hour 50 minutes'
FROM public.conversations conv
JOIN public.contacts c ON conv.contact_id = c.id
WHERE c.name = 'João Silva';

INSERT INTO public.messages (conversation_id, from_phone, to_phone, body, is_from_bot, timestamp) 
SELECT 
    conv.id,
    '5511999887766',
    '5511000000000',
    'Sim, por favor! E também gostaria de agendar uma demonstração.',
    false,
    NOW() - INTERVAL '1 hour 45 minutes'
FROM public.conversations conv
JOIN public.contacts c ON conv.contact_id = c.id
WHERE c.name = 'João Silva';

-- Mensagens para Pedro Oliveira (problema técnico)
INSERT INTO public.messages (conversation_id, from_phone, to_phone, body, is_from_bot, timestamp) 
SELECT 
    conv.id,
    '5511777665544',
    '5511000000000',
    'Estou com problema na instalação do software. Não consigo fazer login.',
    false,
    NOW() - INTERVAL '3 hours'
FROM public.conversations conv
JOIN public.contacts c ON conv.contact_id = c.id
WHERE c.name = 'Pedro Oliveira';

INSERT INTO public.messages (conversation_id, from_phone, to_phone, body, is_from_bot, timestamp) 
SELECT 
    conv.id,
    '5511000000000',
    '5511777665544',
    'Olá Pedro! Vou te ajudar com isso. Você está recebendo alguma mensagem de erro específica?',
    true,
    NOW() - INTERVAL '2 hours 50 minutes'
FROM public.conversations conv
JOIN public.contacts c ON conv.contact_id = c.id
WHERE c.name = 'Pedro Oliveira';

-- Mensagens para Maria Santos (orçamento resolvido)
INSERT INTO public.messages (conversation_id, from_phone, to_phone, body, is_from_bot, timestamp) 
SELECT 
    conv.id,
    '5511888776655',
    '5511000000000',
    'Gostaria de um orçamento para 50 licenças do software.',
    false,
    NOW() - INTERVAL '1 day'
FROM public.conversations conv
JOIN public.contacts c ON conv.contact_id = c.id
WHERE c.name = 'Maria Santos';

INSERT INTO public.messages (conversation_id, from_phone, to_phone, body, is_from_bot, timestamp) 
SELECT 
    conv.id,
    '5511000000000',
    '5511888776655',
    'Perfeito, Maria! Preparei um orçamento especial para você. Estou enviando por email agora.',
    true,
    NOW() - INTERVAL '23 hours'
FROM public.conversations conv
JOIN public.contacts c ON conv.contact_id = c.id
WHERE c.name = 'Maria Santos';

-- ============================================================================
-- BASE DE CONHECIMENTO DE EXEMPLO
-- ============================================================================

INSERT INTO public.knowledge_base (title, content, category, tags, is_active, usage_count) VALUES
('Como fazer login no sistema', 
'Para fazer login no sistema: 1. Acesse a página de login 2. Digite seu email e senha 3. Clique em "Entrar" 4. Se esqueceu a senha, clique em "Esqueci minha senha"', 
'Suporte Técnico', 
ARRAY['login', 'acesso', 'senha'], 
true, 15),

('Preços e planos disponíveis', 
'Nossos planos: BÁSICO (R$ 99/mês) - até 10 usuários, PROFISSIONAL (R$ 199/mês) - até 50 usuários, EMPRESARIAL (R$ 399/mês) - usuários ilimitados. Todos incluem suporte 24/7.', 
'Vendas', 
ARRAY['preço', 'plano', 'valor'], 
true, 32),

('Horário de funcionamento', 
'Nosso atendimento funciona de Segunda a Sexta das 8h às 18h, e Sábados das 9h às 14h. Suporte técnico 24/7 para clientes premium.', 
'Atendimento', 
ARRAY['horário', 'funcionamento', 'atendimento'], 
true, 8),

('Como cancelar assinatura', 
'Para cancelar: 1. Faça login na sua conta 2. Vá em Configurações > Assinatura 3. Clique em "Cancelar assinatura" 4. Confirme o cancelamento. A assinatura permanece ativa até o fim do período pago.', 
'Suporte Técnico', 
ARRAY['cancelar', 'assinatura', 'conta'], 
true, 5),

('Política de reembolso', 
'Oferecemos reembolso total em até 30 dias após a compra, sem perguntas. Para solicitar, entre em contato conosco informando o número do pedido.', 
'Vendas', 
ARRAY['reembolso', 'devolução', 'garantia'], 
true, 12);

-- ============================================================================
-- REGRAS DE AUTOMAÇÃO DE EXEMPLO
-- ============================================================================

INSERT INTO public.automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, is_active) VALUES
('Saudação Inicial', 
'Envia mensagem de boas-vindas para novos contatos', 
'first_message', 
'{"conditions": {"is_first_contact": true}}', 
'send_message', 
'{"message": "Olá! Bem-vindo(a) ao Tiaen Chat! Como posso te ajudar hoje?", "delay_seconds": 2}', 
true),

('Resposta Automática - Horário Comercial', 
'Informa horário de funcionamento fora do expediente', 
'time', 
'{"schedule": {"type": "outside_business_hours", "business_hours": {"start": "08:00", "end": "18:00", "days": [1,2,3,4,5]}}}', 
'send_message', 
'{"message": "Obrigado pelo contato! Nosso horário de atendimento é de Segunda a Sexta das 8h às 18h. Retornaremos assim que possível."}', 
true),

('Transferir para Suporte - Palavra-chave', 
'Transfere conversas com problemas técnicos para agente especializado', 
'keyword', 
'{"keywords": ["erro", "bug", "problema", "não funciona", "falha"], "match_type": "any"}', 
'transfer_agent', 
'{"agent_role": "support", "priority": "high", "note": "Cliente reportou problema técnico"}', 
true),

('Tag VIP - Alto Valor', 
'Adiciona tag VIP para clientes que mencionam valores altos', 
'keyword', 
'{"keywords": ["1000", "mil", "premium", "empresarial"], "match_type": "any"}', 
'add_tag', 
'{"tags": ["vip", "alto_valor"], "priority": "high"}', 
true);

-- ============================================================================
-- INSTÂNCIAS EVOLUTION API DE EXEMPLO
-- ============================================================================

INSERT INTO public.evolution_instances (name, status, phone, webhook_url, settings) VALUES
('Atendimento Principal', 'connected', '5511000000000', 'https://seu-app.com/api/webhook', 
'{"auto_reply": true, "save_media": true, "webhook_events": ["message", "status"]}'),

('Suporte Técnico', 'disconnected', null, 'https://seu-app.com/api/webhook/support', 
'{"auto_reply": false, "save_media": true, "webhook_events": ["message"]}'),

('Vendas', 'connecting', null, 'https://seu-app.com/api/webhook/sales', 
'{"auto_reply": true, "save_media": false, "webhook_events": ["message", "status", "presence"]}');

-- ============================================================================
-- MÉTRICAS DE EXEMPLO (ÚLTIMOS 7 DIAS)
-- ============================================================================

INSERT INTO public.daily_metrics (date, total_conversations, active_conversations, resolved_conversations, total_messages, bot_messages, human_messages, average_response_time_seconds, customer_satisfaction) VALUES
(CURRENT_DATE - INTERVAL '6 days', 45, 12, 28, 234, 156, 78, 180, 4.2),
(CURRENT_DATE - INTERVAL '5 days', 52, 15, 31, 287, 189, 98, 165, 4.5),
(CURRENT_DATE - INTERVAL '4 days', 38, 8, 25, 198, 134, 64, 195, 4.1),
(CURRENT_DATE - INTERVAL '3 days', 61, 18, 35, 342, 223, 119, 142, 4.7),
(CURRENT_DATE - INTERVAL '2 days', 47, 14, 29, 256, 167, 89, 173, 4.3),
(CURRENT_DATE - INTERVAL '1 day', 55, 16, 33, 298, 201, 97, 158, 4.6),
(CURRENT_DATE, 42, 11, 26, 189, 128, 61, 187, 4.4);

-- Métricas por hora para hoje
INSERT INTO public.hourly_metrics (datetime, messages_count, conversations_count, bot_responses, average_response_time_seconds) VALUES
(DATE_TRUNC('hour', NOW()) - INTERVAL '23 hours', 12, 3, 8, 145),
(DATE_TRUNC('hour', NOW()) - INTERVAL '22 hours', 8, 2, 5, 167),
(DATE_TRUNC('hour', NOW()) - INTERVAL '21 hours', 15, 4, 11, 123),
(DATE_TRUNC('hour', NOW()) - INTERVAL '20 hours', 23, 6, 16, 189),
(DATE_TRUNC('hour', NOW()) - INTERVAL '19 hours', 18, 5, 12, 156),
(DATE_TRUNC('hour', NOW()) - INTERVAL '18 hours', 31, 8, 22, 134),
(DATE_TRUNC('hour', NOW()) - INTERVAL '17 hours', 28, 7, 19, 178),
(DATE_TRUNC('hour', NOW') - INTERVAL '16 hours', 25, 6, 17, 162),
(DATE_TRUNC('hour', NOW()) - INTERVAL '15 hours', 22, 5, 15, 145),
(DATE_TRUNC('hour', NOW()) - INTERVAL '14 hours', 19, 4, 13, 198),
(DATE_TRUNC('hour', NOW()) - INTERVAL '13 hours', 16, 3, 11, 176),
(DATE_TRUNC('hour', NOW()) - INTERVAL '12 hours', 21, 5, 14, 154);

-- ============================================================================
-- LOGS DE ATIVIDADE DE EXEMPLO
-- ============================================================================

INSERT INTO public.activity_logs (activity_type, entity_type, title, description, created_at) VALUES
('message', 'conversation', 'Nova mensagem recebida', 'João Silva enviou: "Gostaria de saber sobre os novos produtos"', NOW() - INTERVAL '2 hours'),
('bot_response', 'message', 'Resposta automática enviada', 'Bot respondeu sobre catálogo de produtos', NOW() - INTERVAL '1 hour 50 minutes'),
('contact_added', 'contact', 'Novo contato adicionado', 'Fernanda Alves foi adicionada aos contatos', NOW() - INTERVAL '3 hours'),
('automation_executed', 'automation', 'Automação executada', 'Regra "Saudação Inicial" foi acionada', NOW() - INTERVAL '4 hours'),
('conversation_resolved', 'conversation', 'Conversa resolvida', 'Conversa com Maria Santos foi marcada como resolvida', NOW() - INTERVAL '5 hours'),
('instance_connected', 'evolution', 'Instância conectada', 'WhatsApp "Atendimento Principal" foi conectado', NOW() - INTERVAL '6 hours'),
('knowledge_used', 'rag', 'Base de conhecimento consultada', 'Artigo "Como fazer login" foi utilizado em resposta', NOW() - INTERVAL '1 hour'),
('system_backup', 'system', 'Backup realizado', 'Backup automático das conversas foi concluído', NOW() - INTERVAL '12 hours');

-- ============================================================================
-- CONSULTAS RAG DE EXEMPLO
-- ============================================================================

INSERT INTO public.rag_queries (conversation_id, query, response, confidence, sources, reasoning, processing_time_ms) 
SELECT 
    conv.id,
    'Como faço para fazer login no sistema?',
    'Para fazer login no sistema, siga estes passos: 1. Acesse a página de login 2. Digite seu email e senha 3. Clique em "Entrar" 4. Se esqueceu a senha, clique em "Esqueci minha senha"',
    0.95,
    '[{"id": "' || kb.id || '", "title": "Como fazer login no sistema", "similarity": 0.95}]',
    'Encontrei informações específicas sobre login na base de conhecimento com alta similaridade.',
    245
FROM public.conversations conv
JOIN public.contacts c ON conv.contact_id = c.id
JOIN public.knowledge_base kb ON kb.title = 'Como fazer login no sistema'
WHERE c.name = 'Pedro Oliveira'
LIMIT 1;

-- ============================================================================
-- EXECUÇÕES DE AUTOMAÇÃO DE EXEMPLO
-- ============================================================================

INSERT INTO public.automation_executions (rule_id, conversation_id, trigger_data, action_data, status, execution_time_ms, executed_at)
SELECT 
    ar.id,
    conv.id,
    '{"trigger": "first_message", "contact_name": "' || c.name || '"}',
    '{"message_sent": "Olá! Bem-vindo(a) ao Tiaen Chat! Como posso te ajudar hoje?", "delay_applied": 2}',
    'success',
    156,
    NOW() - (RANDOM() * INTERVAL '24 hours')
FROM public.automation_rules ar
JOIN public.conversations conv ON true
JOIN public.contacts c ON conv.contact_id = c.id
WHERE ar.name = 'Saudação Inicial'
AND c.name IN ('João Silva', 'Maria Santos', 'Pedro Oliveira')
LIMIT 3;

-- ============================================================================
-- CONFIGURAÇÕES DE IA DE EXEMPLO
-- ============================================================================

INSERT INTO public.ai_configurations (name, provider, model, api_key_encrypted, temperature, max_tokens, system_prompt, is_active) VALUES
('OpenAI GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo', 'sk-exemplo-chave-api-openai-aqui', 0.7, 1000, 
'Você é um assistente virtual inteligente para atendimento ao cliente via WhatsApp.

Suas responsabilidades:
- Responder perguntas usando a base de conhecimento fornecida
- Ser educado, prestativo e profissional
- Manter conversas focadas no atendimento
- Transferir para agente humano quando necessário
- Sempre responder em português brasileiro

Diretrizes:
- Use informações da base de conhecimento quando disponível
- Se não souber a resposta, seja honesto e ofereça transferir para um agente
- Mantenha respostas concisas e claras
- Use emojis com moderação para humanizar a conversa', true);

-- ============================================================================
-- CONFIGURAÇÕES DO SISTEMA DE EXEMPLO
-- ============================================================================

INSERT INTO public.system_settings (key, value, description) VALUES
('evolution_api_url', '"https://api.evolution.tiaen.com.br"', 'URL base da Evolution API'),
('evolution_api_key', '"sua-chave-api-evolution-aqui"', 'Chave de API da Evolution'),
('evolution_instance_name', '"tiaen-principal"', 'Nome da instância principal do WhatsApp'),
('evolution_webhook_url', '"https://app.tiaen.com.br/api/webhook"', 'URL do webhook para receber eventos'),
('system_configured', 'true', 'Indica se o sistema foi configurado inicialmente'),
('auto_reply_enabled', 'true', 'Habilita respostas automáticas do bot'),
('business_hours_start', '"08:00"', 'Horário de início do atendimento'),
('business_hours_end', '"18:00"', 'Horário de fim do atendimento'),
('business_days', '[1,2,3,4,5]', 'Dias da semana de atendimento (1=segunda, 7=domingo)'),
('max_response_time_minutes', '30', 'Tempo máximo para resposta automática em minutos'),
('customer_satisfaction_enabled', 'true', 'Habilita pesquisa de satisfação'),
('analytics_retention_days', '90', 'Dias de retenção dos dados de analytics');

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Atualizar contadores de uso da base de conhecimento
UPDATE public.knowledge_base 
SET usage_count = usage_count + FLOOR(RANDOM() * 10)
WHERE is_active = true;

-- Atualizar timestamps de última mensagem nas conversas
UPDATE public.conversations 
SET last_message_at = (
    SELECT MAX(timestamp) 
    FROM public.messages 
    WHERE conversation_id = conversations.id
)
WHERE EXISTS (
    SELECT 1 FROM public.messages 
    WHERE conversation_id = conversations.id
);

-- ============================================================================
-- CONSULTAS ÚTEIS PARA VERIFICAÇÃO
-- ============================================================================

-- Verificar dados inseridos
-- SELECT 'Contatos' as tabela, COUNT(*) as total FROM public.contacts
-- UNION ALL
-- SELECT 'Conversas', COUNT(*) FROM public.conversations
-- UNION ALL
-- SELECT 'Mensagens', COUNT(*) FROM public.messages
-- UNION ALL
-- SELECT 'Base de Conhecimento', COUNT(*) FROM public.knowledge_base
-- UNION ALL
-- SELECT 'Regras de Automação', COUNT(*) FROM public.automation_rules
-- UNION ALL
-- SELECT 'Instâncias Evolution', COUNT(*) FROM public.evolution_instances
-- UNION ALL
-- SELECT 'Métricas Diárias', COUNT(*) FROM public.daily_metrics
-- UNION ALL
-- SELECT 'Logs de Atividade', COUNT(*) FROM public.activity_logs;

-- ============================================================================
-- FIM DOS DADOS DE EXEMPLO
-- ============================================================================ 