// Tipos para o sistema RAG
export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  body: string
  timestamp: Date
  type: 'text' | 'image' | 'audio' | 'video' | 'document'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  isFromBot: boolean
  metadata?: {
    fileName?: string
    mimeType?: string
    caption?: string
  }
}

export interface Contact {
  id: string
  phone: string
  name: string
  profilePicture?: string
  lastSeen?: Date
  isOnline: boolean
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  contactId: string
  contact: Contact
  messages: WhatsAppMessage[]
  status: 'active' | 'resolved' | 'pending' | 'archived'
  assignedAgent?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
}

export interface KnowledgeBase {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  embedding?: number[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface RAGResponse {
  answer: string
  confidence: number
  sources: KnowledgeBase[]
  reasoning?: string
  suggestedActions?: string[]
}

export interface Agent {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'offline' | 'busy' | 'away'
  activeConversations: number
  totalConversations: number
  averageResponseTime: number
  rating: number
  specialties: string[]
  lastActivity: Date
}

export interface EvolutionInstance {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  qrCode?: string
  phone?: string
  profilePicture?: string
  webhook?: string
  createdAt: Date
  lastConnection?: Date
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: {
    type: 'keyword' | 'time' | 'sentiment' | 'first_message'
    value: string
    conditions?: Record<string, any>
  }
  action: {
    type: 'send_message' | 'transfer_agent' | 'add_tag' | 'create_ticket'
    value: string
    parameters?: Record<string, any>
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Analytics {
  totalConversations: number
  activeConversations: number
  resolvedConversations: number
  averageResponseTime: number
  customerSatisfaction: number
  topCategories: Array<{
    category: string
    count: number
  }>
  messageVolume: Array<{
    date: string
    incoming: number
    outgoing: number
  }>
  agentPerformance: Array<{
    agentId: string
    name: string
    conversations: number
    responseTime: number
    rating: number
  }>
}

export interface OpenAIConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export interface EvolutionConfig {
  baseUrl: string
  apiKey: string
  instanceName: string
  webhook: string
} 