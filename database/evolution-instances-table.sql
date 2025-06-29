-- Tabela para armazenar configurações das instâncias Evolution API
CREATE TABLE IF NOT EXISTS evolution_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_name VARCHAR(100) NOT NULL UNIQUE,
  ai_enabled BOOLEAN DEFAULT true,
  auto_response BOOLEAN DEFAULT true,
  welcome_message TEXT DEFAULT 'Olá! Como posso ajudá-lo hoje?',
  status VARCHAR(20) DEFAULT 'close',
  webhook_configured BOOLEAN DEFAULT false,
  webhook_url TEXT,
  api_key TEXT,
  phone VARCHAR(20),
  profile_picture_url TEXT,
  last_connection TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_evolution_instances_name ON evolution_instances(instance_name);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_status ON evolution_instances(status);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_created_at ON evolution_instances(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_evolution_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_evolution_instances_updated_at
  BEFORE UPDATE ON evolution_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_evolution_instances_updated_at();

-- RLS (Row Level Security) - opcional, se você quiser restringir acesso por usuário
-- ALTER TABLE evolution_instances ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo (ajuste conforme necessário)
-- CREATE POLICY "Permitir acesso completo a evolution_instances" ON evolution_instances
--   FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE evolution_instances IS 'Configurações das instâncias Evolution API';
COMMENT ON COLUMN evolution_instances.instance_name IS 'Nome único da instância';
COMMENT ON COLUMN evolution_instances.ai_enabled IS 'Se a IA está habilitada para esta instância';
COMMENT ON COLUMN evolution_instances.auto_response IS 'Se respostas automáticas estão ativas';
COMMENT ON COLUMN evolution_instances.welcome_message IS 'Mensagem de boas-vindas personalizada';
COMMENT ON COLUMN evolution_instances.status IS 'Status da conexão: open, close, connecting';
COMMENT ON COLUMN evolution_instances.webhook_configured IS 'Se o webhook foi configurado';
COMMENT ON COLUMN evolution_instances.webhook_url IS 'URL do webhook configurado';
COMMENT ON COLUMN evolution_instances.phone IS 'Número do WhatsApp conectado';
COMMENT ON COLUMN evolution_instances.profile_picture_url IS 'URL da foto de perfil';
COMMENT ON COLUMN evolution_instances.last_connection IS 'Última vez que a instância se conectou';

-- Inserir algumas instâncias de exemplo (opcional)
INSERT INTO evolution_instances (instance_name, ai_enabled, auto_response, welcome_message, status) 
VALUES 
  ('atendimento', true, true, 'Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo?', 'close'),
  ('vendas', true, false, 'Oi! Interessado em nossos produtos? Vou te ajudar!', 'close'),
  ('suporte', true, true, 'Olá! Precisa de suporte técnico? Estou aqui para ajudar.', 'close')
ON CONFLICT (instance_name) DO NOTHING; 