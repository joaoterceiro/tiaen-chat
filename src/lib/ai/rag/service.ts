import { createClient } from '@supabase/supabase-js';
import { RagDocument } from '@/types/database';
import OpenAI from 'openai';

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

interface ProcessDocumentParams {
  instanceId: string;
  fileName: string;
  content: string;
  metadata?: Record<string, any>;
}

interface SearchParams {
  instanceId: string;
  query: string;
  limit?: number;
  similarityThreshold?: number;
}

export class RAGService {
  private supabase: ReturnType<typeof createClient>;
  private openai: OpenAI;

  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });

    return response.data[0].embedding;
  }

  async processDocument({
    instanceId,
    fileName,
    content,
    metadata = {}
  }: ProcessDocumentParams): Promise<RagDocument> {
    try {
      // Generate embedding for the document
      const embedding = await this.generateEmbedding(content);

      // Store document with embedding
      const { data: document, error } = await this.supabase
        .from('rag_documents')
        .insert({
          instance_id: instanceId,
          file_name: fileName,
          file_path: `${instanceId}/${fileName}`,
          content,
          content_vector: embedding,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      return document;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  async searchDocuments({
    instanceId,
    query,
    limit = 5,
    similarityThreshold = 0.7
  }: SearchParams): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);

      // Search for similar documents using pgvector
      const { data: results, error } = await this.supabase
        .rpc('search_documents', {
          query_embedding: embedding,
          match_threshold: similarityThreshold,
          match_count: limit,
          p_instance_id: instanceId
        });

      if (error) throw error;

      return results.map((result: any) => ({
        id: result.id,
        content: result.content,
        similarity: result.similarity,
        metadata: result.metadata
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('rag_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async getDocuments(instanceId: string): Promise<RagDocument[]> {
    try {
      const { data: documents, error } = await this.supabase
        .from('rag_documents')
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async enhancePrompt(query: string, context: string[]): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant. Your task is to enhance the user's query with relevant context from the knowledge base. The enhanced prompt should guide the response to be more accurate and contextual.

Context from knowledge base:
${context.join('\n\n')}

Generate a comprehensive prompt that incorporates this context while maintaining the original intent of the user's query.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      throw error;
    }
  }

  async processQuery(
    instanceId: string,
    query: string,
    similarityThreshold = 0.7
  ): Promise<{
    enhancedPrompt: string;
    relevantDocs: SearchResult[];
  }> {
    try {
      // Search for relevant documents
      const relevantDocs = await this.searchDocuments({
        instanceId,
        query,
        similarityThreshold
      });

      // If no relevant documents found, return original query
      if (relevantDocs.length === 0) {
        return {
          enhancedPrompt: query,
          relevantDocs: []
        };
      }

      // Extract content from relevant documents
      const context = relevantDocs.map(doc => doc.content);

      // Enhance the prompt with context
      const enhancedPrompt = await this.enhancePrompt(query, context);

      return {
        enhancedPrompt,
        relevantDocs
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }
} 