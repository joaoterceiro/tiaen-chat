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

// Tipos específicos para uso na aplicação
export type Profile = Tables<'profiles'>;
export type Contact = Tables<'contacts'>;
export type Conversation = Tables<'conversations'>;
export type Message = Tables<'messages'>;
export type KnowledgeBase = Tables<'knowledge_base'>;

// Tipos de inserção
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type KnowledgeBaseInsert = Database['public']['Tables']['knowledge_base']['Insert'];

// Tipos de enums
export type UserRole = Enums<'user_role'>;
export type UserStatus = Enums<'user_status'>;
export type ConversationStatus = Enums<'conversation_status'>;
export type MessageType = Enums<'message_type'>;

export default Database;