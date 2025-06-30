import { EvolutionInstance, EvolutionInstanceInsert, AiConfiguration } from '@/types/database';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RAGService } from '@/lib/ai/rag/service';
import OpenAI from 'openai';

// Types for Evolution API responses
interface EvolutionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface InstanceStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qrCode?: string;
  error?: string;
}

interface SendMessageParams {
  phone: string;
  message: string;
  instanceId: string;
}

interface ProcessMessageParams {
  instanceId: string;
  phone: string;
  message: string;
  aiConfig?: AiConfiguration;
  useRAG?: boolean;
}

export class EvolutionAPI {
  private baseUrl: string;
  private apiKey: string;
  private supabase: SupabaseClient<any, "public", any>;
  private openai: OpenAI;
  private ragService: RAGService;

  constructor(baseUrl: string, apiKey: string, supabase: SupabaseClient<any, "public", any>) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.supabase = supabase;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.ragService = new RAGService(supabase);
  }

  // Instance Management
  async createInstance(name: string, description?: string): Promise<EvolutionResponse<EvolutionInstance>> {
    try {
      // Create instance in Evolution API
      const response = await fetch(`${this.baseUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        throw new Error(`Failed to create instance: ${response.statusText}`);
      }

      const evolutionData = await response.json();

      // Create instance record in Supabase
      const { data: instance, error } = await this.supabase
        .from('evolution_instances')
        .insert({
          name,
          description,
          status: 'disconnected',
          webhook_url: `${this.baseUrl}/webhook/${evolutionData.instanceId}`
        })
        .select()
        .single();

      if (error) throw error;

      // Create default AI configuration
      const { error: aiError } = await this.supabase
        .from('ai_configurations')
        .insert({
          instance_id: instance.id,
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 1000,
          is_active: true
        });

      if (aiError) throw aiError;

      return {
        success: true,
        data: instance
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async deleteInstance(instanceId: string): Promise<EvolutionResponse> {
    try {
      // Delete from Evolution API
      const response = await fetch(`${this.baseUrl}/instance/${instanceId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete instance: ${response.statusText}`);
      }

      // Delete from Supabase (cascade will handle related records)
      const { error } = await this.supabase
        .from('evolution_instances')
        .delete()
        .eq('id', instanceId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getInstanceStatus(instanceId: string): Promise<EvolutionResponse<InstanceStatus>> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/${instanceId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get instance status: ${response.statusText}`);
      }

      const status = await response.json();

      // Update status in Supabase
      const { error } = await this.supabase
        .from('evolution_instances')
        .update({ status: status.status })
        .eq('id', instanceId);

      if (error) throw error;

      return {
        success: true,
        data: status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateQRCode(instanceId: string): Promise<EvolutionResponse<string>> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/${instanceId}/qr`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate QR code: ${response.statusText}`);
      }

      const { qrCode } = await response.json();

      // Update QR code in Supabase
      const { error } = await this.supabase
        .from('evolution_instances')
        .update({ qr_code: qrCode })
        .eq('id', instanceId);

      if (error) throw error;

      return {
        success: true,
        data: qrCode
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async sendMessage({ instanceId, phone, message }: SendMessageParams): Promise<EvolutionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/${instanceId}/message/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          phone,
          message
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      // Log message in Supabase
      const { error } = await this.supabase
        .from('chat_messages')
        .insert({
          instance_id: instanceId,
          phone_number: phone,
          message,
          is_bot: true
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async disconnect(instanceId: string): Promise<EvolutionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/${instanceId}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect instance: ${response.statusText}`);
      }

      // Update status in Supabase
      const { error } = await this.supabase
        .from('evolution_instances')
        .update({
          status: 'disconnected',
          qr_code: null
        })
        .eq('id', instanceId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // AI-specific functionality
  async processMessage({
    instanceId,
    phone,
    message,
    aiConfig,
    useRAG = true
  }: ProcessMessageParams): Promise<EvolutionResponse<string>> {
    try {
      // If no AI config provided, fetch it
      if (!aiConfig) {
        const { data: config, error } = await this.supabase
          .from('ai_configurations')
          .select('*')
          .eq('instance_id', instanceId)
          .single();

        if (error) throw error;
        aiConfig = config;
      }

      // Check if AI is active
      if (!aiConfig.is_active) {
        return {
          success: false,
          error: 'AI processing is not active for this instance'
        };
      }

      let enhancedPrompt = message;
      let relevantDocs = [];

      // Use RAG if enabled
      if (useRAG) {
        const ragResult = await this.ragService.processQuery(instanceId, message);
        enhancedPrompt = ragResult.enhancedPrompt;
        relevantDocs = ragResult.relevantDocs;
      }

      // Process message with OpenAI
      const response = await this.openai.chat.completions.create({
        model: aiConfig.model,
        messages: [
          ...(aiConfig.system_prompt ? [{
            role: 'system',
            content: aiConfig.system_prompt
          }] : []),
          // Add context from RAG if available
          ...(relevantDocs.length > 0 ? [{
            role: 'system',
            content: `Here is some relevant context for the query:\n\n${relevantDocs.map(doc => doc.content).join('\n\n')}`
          }] : []),
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.max_tokens
      });

      const aiResponse = response.choices[0].message.content;

      // Send AI response
      await this.sendMessage({
        instanceId,
        phone,
        message: aiResponse
      });

      // Log RAG query if used
      if (useRAG && relevantDocs.length > 0) {
        await this.supabase
          .from('rag_queries')
          .insert({
            conversation_id: `${instanceId}:${phone}`,
            query: message,
            response: aiResponse,
            sources: {
              documents: relevantDocs.map(doc => ({
                id: doc.id,
                similarity: doc.similarity
              }))
            },
            processing_time_ms: Date.now() - performance.now()
          });
      }

      return {
        success: true,
        data: aiResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
