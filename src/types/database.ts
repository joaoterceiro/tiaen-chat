// ============================================================================
// TIAEN CHAT - TIPOS DO BANCO DE DADOS
// ============================================================================
// Tipos TypeScript gerados a partir do schema Supabase
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'agent' | 'user';
          status: 'online' | 'offline' | 'busy' | 'away';
          phone: string | null;
          timezone: string;
          preferences: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'agent' | 'user';
          status?: 'online' | 'offline' | 'busy' | 'away';
          phone?: string | null;
          timezone?: string;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'agent' | 'user';
          status?: 'online' | 'offline' | 'busy' | 'away';
          phone?: string | null;
          timezone?: string;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          phone: string;
          name: string;
          profile_picture: string | null;
          last_seen: string | null;
          is_online: boolean;
          tags: string[];
          notes: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          name: string;
          profile_picture?: string | null;
          last_seen?: string | null;
          is_online?: boolean;
          tags?: string[];
          notes?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          name?: string;
          profile_picture?: string | null;
          last_seen?: string | null;
          is_online?: boolean;
          tags?: string[];
          notes?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          contact_id: string;
          assigned_agent_id: string | null;
          status: 'active' | 'resolved' | 'pending' | 'archived';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          tags: string[];
          summary: string | null;
          sentiment: 'positive' | 'neutral' | 'negative' | null;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          assigned_agent_id?: string | null;
          status?: 'active' | 'resolved' | 'pending' | 'archived';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          tags?: string[];
          summary?: string | null;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          assigned_agent_id?: string | null;
          status?: 'active' | 'resolved' | 'pending' | 'archived';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          tags?: string[];
          summary?: string | null;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          whatsapp_id: string | null;
          from_phone: string;
          to_phone: string;
          body: string;
          message_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
          status: 'sent' | 'delivered' | 'read' | 'failed';
          is_from_bot: boolean;
          metadata: Record<string, any>;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          whatsapp_id?: string | null;
          from_phone: string;
          to_phone: string;
          body: string;
          message_type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
          status?: 'sent' | 'delivered' | 'read' | 'failed';
          is_from_bot?: boolean;
          metadata?: Record<string, any>;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          whatsapp_id?: string | null;
          from_phone?: string;
          to_phone?: string;
          body?: string;
          message_type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
          status?: 'sent' | 'delivered' | 'read' | 'failed';
          is_from_bot?: boolean;
          metadata?: Record<string, any>;
          timestamp?: string;
          created_at?: string;
        };
      };
      knowledge_base: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          tags: string[];
          embedding: number[] | null;
          is_active: boolean;
          usage_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category: string;
          tags?: string[];
          embedding?: number[] | null;
          is_active?: boolean;
          usage_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          tags?: string[];
          embedding?: number[] | null;
          is_active?: boolean;
          usage_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_metrics: {
        Row: {
          id: string;
          date: string;
          total_conversations: number;
          active_conversations: number;
          resolved_conversations: number;
          total_messages: number;
          bot_messages: number;
          human_messages: number;
          average_response_time_seconds: number;
          customer_satisfaction: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          total_conversations?: number;
          active_conversations?: number;
          resolved_conversations?: number;
          total_messages?: number;
          bot_messages?: number;
          human_messages?: number;
          average_response_time_seconds?: number;
          customer_satisfaction?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total_conversations?: number;
          active_conversations?: number;
          resolved_conversations?: number;
          total_messages?: number;
          bot_messages?: number;
          human_messages?: number;
          average_response_time_seconds?: number;
          customer_satisfaction?: number | null;
          created_at?: string;
        };
      };
      hourly_metrics: {
        Row: {
          id: string;
          datetime: string;
          messages_count: number;
          conversations_count: number;
          bot_responses: number;
          average_response_time_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          datetime: string;
          messages_count?: number;
          conversations_count?: number;
          bot_responses?: number;
          average_response_time_seconds?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          datetime?: string;
          messages_count?: number;
          conversations_count?: number;
          bot_responses?: number;
          average_response_time_seconds?: number;
          created_at?: string;
        };
      };
      automation_rules: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          trigger_type: 'keyword' | 'time' | 'sentiment' | 'first_message' | 'schedule';
          trigger_config: Record<string, any>;
          action_type: 'send_message' | 'transfer_agent' | 'add_tag' | 'create_ticket' | 'webhook';
          action_config: Record<string, any>;
          is_active: boolean;
          execution_count: number;
          last_executed_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          trigger_type: 'keyword' | 'time' | 'sentiment' | 'first_message' | 'schedule';
          trigger_config: Record<string, any>;
          action_type: 'send_message' | 'transfer_agent' | 'add_tag' | 'create_ticket' | 'webhook';
          action_config: Record<string, any>;
          is_active?: boolean;
          execution_count?: number;
          last_executed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          trigger_type?: 'keyword' | 'time' | 'sentiment' | 'first_message' | 'schedule';
          trigger_config?: Record<string, any>;
          action_type?: 'send_message' | 'transfer_agent' | 'add_tag' | 'create_ticket' | 'webhook';
          action_config?: Record<string, any>;
          is_active?: boolean;
          execution_count?: number;
          last_executed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      automation_executions: {
        Row: {
          id: string;
          rule_id: string;
          conversation_id: string;
          trigger_data: Record<string, any> | null;
          action_data: Record<string, any> | null;
          status: 'success' | 'failed' | 'skipped';
          error_message: string | null;
          execution_time_ms: number | null;
          executed_at: string;
        };
        Insert: {
          id?: string;
          rule_id: string;
          conversation_id: string;
          trigger_data?: Record<string, any> | null;
          action_data?: Record<string, any> | null;
          status?: 'success' | 'failed' | 'skipped';
          error_message?: string | null;
          execution_time_ms?: number | null;
          executed_at?: string;
        };
        Update: {
          id?: string;
          rule_id?: string;
          conversation_id?: string;
          trigger_data?: Record<string, any> | null;
          action_data?: Record<string, any> | null;
          status?: 'success' | 'failed' | 'skipped';
          error_message?: string | null;
          execution_time_ms?: number | null;
          executed_at?: string;
        };
      };
      evolution_instances: {
        Row: {
          id: string;
          name: string;
          status: 'connected' | 'disconnected' | 'connecting' | 'error';
          qr_code: string | null;
          phone: string | null;
          profile_picture: string | null;
          webhook_url: string | null;
          api_key: string | null;
          settings: Record<string, any>;
          last_connection: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: 'connected' | 'disconnected' | 'connecting' | 'error';
          qr_code?: string | null;
          phone?: string | null;
          profile_picture?: string | null;
          webhook_url?: string | null;
          api_key?: string | null;
          settings?: Record<string, any>;
          last_connection?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: 'connected' | 'disconnected' | 'connecting' | 'error';
          qr_code?: string | null;
          phone?: string | null;
          profile_picture?: string | null;
          webhook_url?: string | null;
          api_key?: string | null;
          settings?: Record<string, any>;
          last_connection?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rag_queries: {
        Row: {
          id: string;
          conversation_id: string;
          query: string;
          response: string;
          confidence: number | null;
          sources: Record<string, any>;
          reasoning: string | null;
          suggested_actions: string[];
          processing_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          query: string;
          response: string;
          confidence?: number | null;
          sources?: Record<string, any>;
          reasoning?: string | null;
          suggested_actions?: string[];
          processing_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          query?: string;
          response?: string;
          confidence?: number | null;
          sources?: Record<string, any>;
          reasoning?: string | null;
          suggested_actions?: string[];
          processing_time_ms?: number | null;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          activity_type: string;
          activity_description: string;
          metadata: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          activity_type: string;
          activity_description: string;
          metadata?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          activity_type?: string;
          activity_description?: string;
          metadata?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      system_settings: {
        Row: {
          id: string;
          key: string;
          value: Record<string, any>;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Record<string, any>;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Record<string, any>;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_configurations: {
        Row: {
          id: string;
          name: string;
          provider: string;
          model: string;
          api_key: string;
          settings: Record<string, any>;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          model: string;
          api_key: string;
          settings?: Record<string, any>;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          provider?: string;
          model?: string;
          api_key?: string;
          settings?: Record<string, any>;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_knowledge: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          title: string;
          content: string;
          category: string;
          tags: string[];
          similarity: number;
        }[];
      };
    };
    Enums: {
      user_role: 'admin' | 'agent' | 'user';
      user_status: 'online' | 'offline' | 'busy' | 'away';
      conversation_status: 'active' | 'resolved' | 'pending' | 'archived';
      message_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
    };
  };
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Tipos de tabelas
export type Profile = Tables<'profiles'>;
export type Contact = Tables<'contacts'>;
export type Conversation = Tables<'conversations'>;
export type Message = Tables<'messages'>;
export type KnowledgeBase = Tables<'knowledge_base'>;
export type DailyMetric = Tables<'daily_metrics'>;
export type HourlyMetric = Tables<'hourly_metrics'>;
export type AutomationRule = Tables<'automation_rules'>;
export type AutomationExecution = Tables<'automation_executions'>;
export type EvolutionInstance = Tables<'evolution_instances'>;
export type RagQuery = Tables<'rag_queries'>;
export type ActivityLog = Tables<'activity_logs'>;
export type SystemSetting = Tables<'system_settings'>;
export type AiConfiguration = Tables<'ai_configurations'>;

// Tipos de inserção
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type KnowledgeBaseInsert = Database['public']['Tables']['knowledge_base']['Insert'];
export type DailyMetricInsert = Database['public']['Tables']['daily_metrics']['Insert'];
export type HourlyMetricInsert = Database['public']['Tables']['hourly_metrics']['Insert'];
export type AutomationRuleInsert = Database['public']['Tables']['automation_rules']['Insert'];
export type AutomationExecutionInsert = Database['public']['Tables']['automation_executions']['Insert'];
export type EvolutionInstanceInsert = Database['public']['Tables']['evolution_instances']['Insert'];
export type RagQueryInsert = Database['public']['Tables']['rag_queries']['Insert'];
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];
export type SystemSettingInsert = Database['public']['Tables']['system_settings']['Insert'];
export type AiConfigurationInsert = Database['public']['Tables']['ai_configurations']['Insert'];

// Tipos de enums
export type UserRole = Enums<'user_role'>;
export type UserStatus = Enums<'user_status'>;
export type ConversationStatus = Enums<'conversation_status'>;
export type MessageType = Enums<'message_type'>;

export default Database;