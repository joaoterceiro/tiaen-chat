-- Function to search documents by vector similarity
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_instance_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rd.id,
    rd.content,
    rd.metadata,
    1 - (rd.content_vector <=> query_embedding) as similarity
  FROM rag_documents rd
  WHERE rd.instance_id = p_instance_id
    AND rd.content_vector IS NOT NULL
    AND 1 - (rd.content_vector <=> query_embedding) > match_threshold
  ORDER BY rd.content_vector <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Index for faster vector similarity search
CREATE INDEX IF NOT EXISTS idx_rag_documents_content_vector ON rag_documents 
USING ivfflat (content_vector vector_cosine_ops)
WITH (lists = 100);

-- Function to update embeddings
CREATE OR REPLACE FUNCTION update_document_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update embedding if content has changed
  IF TG_OP = 'INSERT' OR NEW.content <> OLD.content THEN
    -- Set content_vector to NULL to indicate it needs updating
    NEW.content_vector = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle embedding updates
CREATE TRIGGER trigger_update_document_embedding
  BEFORE UPDATE ON rag_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_embedding();

-- Function to get conversation context
CREATE OR REPLACE FUNCTION get_conversation_context(
  p_instance_id uuid,
  p_phone varchar,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  message text,
  is_bot boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.message,
    cm.is_bot,
    cm.created_at
  FROM chat_messages cm
  WHERE cm.instance_id = p_instance_id
    AND cm.phone_number = p_phone
  ORDER BY cm.created_at DESC
  LIMIT p_limit;
END;
$$; 