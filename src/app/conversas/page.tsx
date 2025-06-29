'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Button, 
  Input, 
  Badge, 
  Avatar,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  Alert,
  AlertDescription,
  Textarea
} from '@/components/ui'
import { RAGProvider, useRAG } from '@/contexts/RAGContext'
import { Conversation, WhatsAppMessage } from '@/types/rag'
import { 
  MessageSquare, 
  Search, 
  Send, 
  Bot, 
  User, 
  MoreVertical,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
  Copy,
  Smile,
  Paperclip
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function ConversasPage() {
  const { 
    conversations, 
    activeConversation, 
    selectConversation,
    sendMessage,
    sendRAGResponse,
    refreshConversations,
    isLoading,
    isSending,
    error,
    clearError
  } = useRAG()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [message, setMessage] = useState('')
  const [isRAGMode, setIsRAGMode] = useState(true)
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [newConversationData, setNewConversationData] = useState({
    phone: '',
    name: '',
    initialMessage: ''
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [activeConversation?.messages])

  // Focus input when conversation changes
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Filter conversations
  const filteredConversations = conversations.filter(conversation => {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeConversation || isSending) return

    const messageText = message.trim()
    setMessage('')

    try {
      if (isRAGMode) {
        await sendRAGResponse(activeConversation.contact.phone, messageText)
      } else {
        await sendMessage(activeConversation.contact.phone, messageText)
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  const handleNewConversation = async () => {
    console.log('Nova conversa:', newConversationData)
    setShowNewConversationModal(false)
    setNewConversationData({ phone: '', name: '', initialMessage: '' })
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900">
                  Conversas WhatsApp
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {conversations.length} conversas
              </Badge>
              
              <Badge variant="primary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {conversations.filter(c => c.status === 'active').length} ativas
              </Badge>

              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowNewConversationModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Conversa
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Alert variant="error">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError}>
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Conversations Sidebar */}
        <div className="w-96 border-r border-secondary-200 bg-white/50 backdrop-blur-sm flex flex-col">
          {/* Sidebar Header */}
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-secondary-500 p-4">
                <MessageSquare className="h-12 w-12 mb-2" />
                <p className="text-sm text-center">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'Nenhuma conversa encontrada' 
                    : 'Nenhuma conversa disponivel'
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!activeConversation ? (
            <div className="flex items-center justify-center h-full bg-secondary-50">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary-200 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-secondary-500" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  Nenhuma conversa selecionada
                </h3>
                <p className="text-secondary-600">
                  Selecione uma conversa para comecar a interagir
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-white">
                <div className="flex items-center gap-3">
                  <Avatar 
                    size="md" 
                    src={activeConversation.contact.profilePicture}
                    fallback={activeConversation.contact.name.charAt(0).toUpperCase()}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-secondary-900">
                        {activeConversation.contact.name}
                      </h3>
                      {activeConversation.contact.isOnline && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-secondary-600">
                      {activeConversation.contact.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getStatusColor(activeConversation.status)}
                    className="text-xs"
                  >
                    {activeConversation.status}
                  </Badge>
                  
                  <Badge 
                    variant={getPriorityColor(activeConversation.priority)}
                    className="text-xs"
                  >
                    {activeConversation.priority}
                  </Badge>

                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
                {activeConversation.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-secondary-200 bg-white">
                {/* RAG Mode Toggle */}
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant={isRAGMode ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setIsRAGMode(true)}
                    className="text-xs"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    IA RAG
                  </Button>
                  <Button
                    variant={!isRAGMode ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setIsRAGMode(false)}
                    className="text-xs"
                  >
                    <User className="h-3 w-3 mr-1" />
                    Manual
                  </Button>
                  <div className="ml-auto text-xs text-secondary-500">
                    {isRAGMode ? 'Resposta sera processada pela IA' : 'Resposta manual'}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        isRAGMode 
                          ? "Digite uma mensagem (sera processada pela IA)..." 
                          : "Digite uma mensagem manual..."
                      }
                      disabled={isSending}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Smile className="h-3 w-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Paperclip className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!message.trim() || isSending}
                    className="h-10 w-10 p-0"
                  >
                    {isSending ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal open={showNewConversationModal} onClose={() => setShowNewConversationModal(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Nova Conversa</ModalTitle>
          </ModalHeader>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Telefone *
                </label>
                <Input
                  placeholder="Ex: +5511999999999"
                  value={newConversationData.phone}
                  onChange={(e) => setNewConversationData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nome do Contato
                </label>
                <Input
                  placeholder="Nome do contato"
                  value={newConversationData.name}
                  onChange={(e) => setNewConversationData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Mensagem Inicial
                </label>
                <Textarea
                  placeholder="Digite a primeira mensagem..."
                  value={newConversationData.initialMessage}
                  onChange={(e) => setNewConversationData(prev => ({ ...prev, initialMessage: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowNewConversationModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleNewConversation}
              disabled={!newConversationData.phone.trim()}
            >
              Iniciar Conversa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  getStatusColor: (status: Conversation['status']) => string
  getPriorityColor: (priority: Conversation['priority']) => string
}

function ConversationItem({ 
  conversation, 
  isActive, 
  onClick, 
  getStatusColor, 
  getPriorityColor 
}: ConversationItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  const unreadCount = conversation.messages.filter(msg => !msg.fromMe && msg.status !== 'read').length

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
        isActive 
          ? 'bg-primary-50 border-primary-200 shadow-sm' 
          : 'bg-white hover:bg-secondary-50 border-secondary-200 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar 
            size="sm" 
            src={conversation.contact.profilePicture}
            fallback={conversation.contact.name.charAt(0).toUpperCase()}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm text-secondary-900 truncate">
                {conversation.contact.name}
              </h4>
              {conversation.contact.isOnline && (
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              )}
            </div>
            <p className="text-xs text-secondary-600 truncate">
              {conversation.contact.phone}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-secondary-500">
            {formatDistanceToNow(conversation.lastMessageAt, { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
          {unreadCount > 0 && (
            <Badge variant="primary" className="text-xs h-5 min-w-5 px-1">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Last Message */}
      {lastMessage && (
        <div className="flex items-center gap-2 mb-2">
          {lastMessage.fromMe ? (
            <User className="h-3 w-3 text-secondary-400 flex-shrink-0" />
          ) : (
            <MessageSquare className="h-3 w-3 text-secondary-400 flex-shrink-0" />
          )}
          <p className="text-sm text-secondary-600 truncate flex-1">
            {lastMessage.body}
          </p>
        </div>
      )}

      {/* Status and Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Badge variant={getStatusColor(conversation.status)} className="text-xs">
            {conversation.status}
          </Badge>
          <Badge variant={getPriorityColor(conversation.priority)} className="text-xs">
            {conversation.priority}
          </Badge>
        </div>
        
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-secondary-400" />
            <span className="text-xs text-secondary-500">
              {conversation.tags.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: WhatsAppMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isFromMe = message.fromMe
  const [showActions, setShowActions] = useState(false)

  const getStatusIcon = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'sent': return <Clock className="h-3 w-3" />
      case 'delivered': return <CheckCircle className="h-3 w-3" />
      case 'read': return <CheckCircle className="h-3 w-3 text-blue-500" />
      case 'failed': return <AlertCircle className="h-3 w-3 text-red-500" />
      default: return null
    }
  }

  const copyMessage = () => {
    navigator.clipboard.writeText(message.body)
  }

  return (
    <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
          isFromMe 
            ? 'bg-primary-500 text-white' 
            : 'bg-white text-secondary-900 border border-secondary-200'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Message Content */}
        <div className="space-y-1">
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.body}
          </p>
          
          <div className={`flex items-center justify-between text-xs ${
            isFromMe ? 'text-primary-100' : 'text-secondary-500'
          }`}>
            <span>
              {format(message.timestamp, 'HH:mm', { locale: ptBR })}
            </span>
            {isFromMe && (
              <div className="flex items-center ml-2">
                {getStatusIcon(message.status)}
              </div>
            )}
          </div>
        </div>

        {/* Message Actions */}
        {showActions && (
          <div className={`absolute top-0 ${
            isFromMe ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
          } flex items-center gap-1 bg-white border border-secondary-200 rounded-lg p-1 shadow-lg`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={copyMessage}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConversasPageWrapper() {
  return (
    <RAGProvider>
      <ConversasPage />
    </RAGProvider>
  )
}
