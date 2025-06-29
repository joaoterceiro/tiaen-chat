'use client'

import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type Contact = Tables['contacts']['Row']
type Conversation = Tables['conversations']['Row']
type Message = Tables['messages']['Row']
type KnowledgeBase = Tables['knowledge_base']['Row']
type AutomationRule = Tables['automation_rules']['Row']
type EvolutionInstance = Tables['evolution_instances']['Row']
type DailyMetrics = Tables['daily_metrics']['Row']

export class SupabaseDataService {
  private supabase = createClient()

  // Contacts
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    const { data, error } = await this.supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const { data, error } = await this.supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getContactByPhone(phone: string): Promise<Contact | null> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data || null
  }

  // Conversations
  async getConversations(): Promise<(Conversation & { contact: Contact; messages: Message[] })[]> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        *,
        contact:contacts(*),
        messages(*)
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return (data || []).map(conv => ({
      ...conv,
      contact: conv.contact as Contact,
      messages: (conv.messages as Message[]).sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    }))
  }

  async createConversation(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getConversationByContactId(contactId: string): Promise<(Conversation & { contact: Contact; messages: Message[] }) | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        *,
        contact:contacts(*),
        messages(*)
      `)
      .eq('contact_id', contactId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

    if (!data) return null

    return {
      ...data,
      contact: data.contact as Contact,
      messages: (data.messages as Message[]).sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    }
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  }

  async createMessage(message: Omit<Message, 'id'>): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Knowledge Base
  async getKnowledgeBase(): Promise<KnowledgeBase[]> {
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createKnowledge(knowledge: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeBase> {
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .insert(knowledge)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateKnowledge(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteKnowledge(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Automation Rules
  async getAutomationRules(): Promise<AutomationRule[]> {
    const { data, error } = await this.supabase
      .from('automation_rules')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>): Promise<AutomationRule> {
    const { data, error } = await this.supabase
      .from('automation_rules')
      .insert(rule)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateAutomationRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const { data, error } = await this.supabase
      .from('automation_rules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteAutomationRule(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('automation_rules')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getActiveAutomationRules(): Promise<AutomationRule[]> {
    const { data, error } = await this.supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Evolution Instances
  async getEvolutionInstances(): Promise<EvolutionInstance[]> {
    const { data, error } = await this.supabase
      .from('evolution_instances')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createEvolutionInstance(instance: Omit<EvolutionInstance, 'id' | 'created_at' | 'updated_at'>): Promise<EvolutionInstance> {
    const { data, error } = await this.supabase
      .from('evolution_instances')
      .insert(instance)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateEvolutionInstance(id: string, updates: Partial<EvolutionInstance>): Promise<EvolutionInstance> {
    const { data, error } = await this.supabase
      .from('evolution_instances')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Metrics
  async getDailyMetrics(days: number = 7): Promise<DailyMetrics[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await this.supabase
      .from('daily_metrics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Dashboard Stats
  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Buscar métricas de hoje e ontem
    const [todayMetrics, yesterdayMetrics] = await Promise.all([
      this.supabase
        .from('daily_metrics')
        .select('*')
        .eq('date', today)
        .single(),
      this.supabase
        .from('daily_metrics')
        .select('*')
        .eq('date', yesterday)
        .single()
    ])

    // Buscar estatísticas gerais
    const [conversationsCount, activeConversations, contactsCount, avgResponseTime] = await Promise.all([
      this.supabase
        .from('conversations')
        .select('id', { count: 'exact' }),
      this.supabase
        .from('conversations')
        .select('id', { count: 'exact' })
        .eq('status', 'active'),
      this.supabase
        .from('contacts')
        .select('id', { count: 'exact' }),
      this.supabase
        .from('daily_metrics')
        .select('average_response_time_seconds')
        .order('date', { ascending: false })
        .limit(7)
    ])

    const todayData = todayMetrics.data || {
      total_conversations: 0,
      total_messages: 0,
      bot_messages: 0,
      human_messages: 0,
      average_response_time_seconds: 0
    }

    const yesterdayData = yesterdayMetrics.data || {
      total_conversations: 0,
      total_messages: 0,
      bot_messages: 0,
      human_messages: 0,
      average_response_time_seconds: 0
    }

    // Calcular mudanças percentuais
    const calculateChange = (today: number, yesterday: number) => {
      if (yesterday === 0) return today > 0 ? 100 : 0
      return Math.round(((today - yesterday) / yesterday) * 100)
    }

    const avgResponseTimeWeek = avgResponseTime.data?.reduce((acc, curr) =>
      acc + (curr.average_response_time_seconds || 0), 0
    ) / (avgResponseTime.data?.length || 1)

    return {
      conversationsToday: {
        value: todayData.total_conversations,
        change: calculateChange(todayData.total_conversations, yesterdayData.total_conversations)
      },
      messagesTotal: {
        value: todayData.total_messages,
        change: calculateChange(todayData.total_messages, yesterdayData.total_messages)
      },
      responseRate: {
        value: todayData.bot_messages > 0 ?
          Math.round((todayData.bot_messages / todayData.total_messages) * 100) : 0,
        change: 0 // Calcular baseado em dados históricos
      },
      avgResponseTime: {
        value: Math.round(avgResponseTimeWeek / 60), // em minutos
        change: 0 // Calcular baseado em dados históricos
      },
      activeContacts: {
        value: contactsCount.count || 0,
        change: 0 // Calcular baseado em dados históricos
      },
      aiResponses: {
        value: todayData.bot_messages,
        change: calculateChange(todayData.bot_messages, yesterdayData.bot_messages)
      }
    }
  }

  // Search functions
  async searchContacts(query: string): Promise<Contact[]> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .or(`name.ilike.%${query}%, phone.ilike.%${query}%, notes.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data || []
  }

  async searchKnowledge(query: string): Promise<KnowledgeBase[]> {
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%, category.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  }

  // AI Configurations
  async getAIConfigurations() {
    const { data, error } = await this.supabase
      .from('ai_configurations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createAIConfiguration(config: {
    name: string
    provider: 'openai' | 'anthropic' | 'google'
    model: string
    api_key_encrypted: string
    temperature?: number
    max_tokens?: number
    system_prompt?: string
  }) {
    const { data, error } = await this.supabase
      .from('ai_configurations')
      .insert({
        ...config,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateAIConfiguration(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('ai_configurations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // System Settings
  async getSystemSetting(key: string) {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  }

  async setSystemSetting(key: string, value: any, description?: string) {
    const { data, error } = await this.supabase
      .from('system_settings')
      .upsert({
        key,
        value,
        description,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const supabaseDataService = new SupabaseDataService() 