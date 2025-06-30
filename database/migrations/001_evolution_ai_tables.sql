-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Evolution instances table
CREATE TABLE IF NOT EXISTS evolution_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'disconnected',
  qr_code TEXT,
  webhook_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- AI configurations table
CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES evolution_instances(id) ON DELETE CASCADE,
  model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RAG documents table
CREATE TABLE IF NOT EXISTS rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES evolution_instances(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  content TEXT,
  content_vector vector(1536), -- For OpenAI embeddings
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES evolution_instances(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE evolution_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their instances"
  ON evolution_instances
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their instances"
  ON evolution_instances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their instances"
  ON evolution_instances
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their instances"
  ON evolution_instances
  FOR DELETE
  USING (auth.uid() = user_id);

-- AI configurations policies
CREATE POLICY "Users can manage AI configs for their instances"
  ON ai_configurations
  USING (EXISTS (
    SELECT 1 FROM evolution_instances
    WHERE evolution_instances.id = ai_configurations.instance_id
    AND evolution_instances.user_id = auth.uid()
  ));

-- RAG documents policies
CREATE POLICY "Users can manage RAG docs for their instances"
  ON rag_documents
  USING (EXISTS (
    SELECT 1 FROM evolution_instances
    WHERE evolution_instances.id = rag_documents.instance_id
    AND evolution_instances.user_id = auth.uid()
  ));

-- Chat messages policies
CREATE POLICY "Users can manage messages for their instances"
  ON chat_messages
  USING (EXISTS (
    SELECT 1 FROM evolution_instances
    WHERE evolution_instances.id = chat_messages.instance_id
    AND evolution_instances.user_id = auth.uid()
  ));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_evolution_instances_updated_at
    BEFORE UPDATE ON evolution_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_configurations_updated_at
    BEFORE UPDATE ON ai_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rag_documents_updated_at
    BEFORE UPDATE ON rag_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_evolution_instances_user_id ON evolution_instances(user_id);
CREATE INDEX idx_evolution_instances_status ON evolution_instances(status);
CREATE INDEX idx_ai_configurations_instance_id ON ai_configurations(instance_id);
CREATE INDEX idx_rag_documents_instance_id ON rag_documents(instance_id);
CREATE INDEX idx_chat_messages_instance_id ON chat_messages(instance_id);
CREATE INDEX idx_chat_messages_phone_number ON chat_messages(phone_number);

-- Enable real-time for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages; 