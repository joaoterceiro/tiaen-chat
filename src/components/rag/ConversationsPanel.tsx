'use client'

import { useState, useMemo } from 'react'
import { 
  Button, 
  Input, 
  Badge, 
  Avatar,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui'
import { useRAG } from '@/contexts/RAGContext'
import { Conversation } from '@/types/rag'
import { Search, Filter, MessageSquare, Clock, User, Tag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ConversationsPanel() {
  const { 
    conversations, 
    activeConversation, 
    selectConversation,
    refreshConversations,
    isLoading 
  } = useRAG()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Filtrar conversas
  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      const matchesSearch = searchQuery === '' || 
        conversation.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.contact.phone.includes(searchQuery) ||
        conversation.messages.some(msg => 
          msg.body.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesStatus = statusFilter === 'all' || conversation.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || conversation.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  }, [conversations, searchQuery, statusFilter, priorityFilter])

  const getStatusColor = (status: Conversation['status']) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning' 
      case 'resolved': return 'default'
      case 'archived': return 'secondary'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: Conversation['priority']) => {
    switch (priority) {
      case 'urgent': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getSentimentColor = (sentiment?: Conversation['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-secondary-900">Conversas</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshConversations}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter} placeholder="Status">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter} placeholder="Prioridade">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary-500">
            <MessageSquare className="h-12 w-12 mb-2" />
            <p className="text-sm">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Nenhuma conversa encontrada' 
                : 'Nenhuma conversa disponível'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversation?.id === conversation.id}
                onClick={() => selectConversation(conversation)}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                getSentimentColor={getSentimentColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  getStatusColor: (status: Conversation['status']) => string
  getPriorityColor: (priority: Conversation['priority']) => string
  getSentimentColor: (sentiment?: Conversation['sentiment']) => string
}

function ConversationItem({ 
  conversation, 
  isActive, 
  onClick, 
  getStatusColor, 
  getPriorityColor, 
  getSentimentColor 
}: ConversationItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  const unreadCount = conversation.messages.filter(msg => !msg.isFromBot && msg.status !== 'read').length

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
        isActive 
          ? 'bg-primary-50 border-primary-200' 
          : 'bg-white hover:bg-secondary-50 border-secondary-200'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar size="sm" fallback={conversation.contact.name.charAt(0).toUpperCase()} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm text-secondary-900 truncate">
                {conversation.contact.name}
              </p>
              {conversation.contact.isOnline && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
            <p className="text-xs text-secondary-600 truncate">
              {conversation.contact.phone}
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Badge variant="primary" className="text-xs">
            {unreadCount}
          </Badge>
        )}
      </div>

      {/* Last Message */}
      {lastMessage && (
        <div className="mb-2">
          <p className="text-sm text-secondary-700 line-clamp-2">
            {lastMessage.isFromBot ? '🤖 ' : ''}
            {lastMessage.body}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(conversation.status) as any} className="text-xs">
            {conversation.status}
          </Badge>
          <Badge variant={getPriorityColor(conversation.priority) as any} className="text-xs">
            {conversation.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-secondary-500">
          {conversation.sentiment && (
            <span className={getSentimentColor(conversation.sentiment)}>
              {conversation.sentiment === 'positive' ? '😊' : 
               conversation.sentiment === 'negative' ? '😞' : '😐'}
            </span>
          )}
          <Clock className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(conversation.lastMessageAt), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
        </div>
      </div>

      {/* Tags */}
      {conversation.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {conversation.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {conversation.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{conversation.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Assigned Agent */}
      {conversation.assignedAgent && (
        <div className="flex items-center gap-1 mt-2 text-xs text-secondary-600">
          <User className="h-3 w-3" />
          <span>Agente: {conversation.assignedAgent}</span>
        </div>
      )}
    </div>
  )
} 