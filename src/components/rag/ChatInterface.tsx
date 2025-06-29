'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Button, 
  Input, 
  Badge, 
  Avatar
} from '@/components/ui'
import { useRAG } from '@/contexts/RAGContext'
import { WhatsAppMessage } from '@/types/rag'
import { 
  Send, 
  Bot, 
  User, 
  MoreVertical, 
  Copy, 
  Download,
  Tag,
  UserPlus,
  Archive,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ChatInterface() {
  const { 
    activeConversation, 
    sendMessage, 
    sendRAGResponse,
    isSending,
    currentAgent
  } = useRAG()

  const [message, setMessage] = useState('')
  const [isRAGMode, setIsRAGMode] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [activeConversation?.messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full bg-secondary-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-200 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-secondary-500" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Nenhuma conversa selecionada
          </h3>
          <p className="text-secondary-600">
            Selecione uma conversa para começar a interagir
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
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
            variant={activeConversation.status === 'active' ? 'success' : 'warning'}
            className="text-xs"
          >
            {activeConversation.status}
          </Badge>
          
          <Badge 
            variant={activeConversation.priority === 'urgent' ? 'error' : 'default'}
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
            RAG Mode
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
          {currentAgent && (
            <Badge variant="secondary" className="text-xs ml-auto">
              {currentAgent.name}
            </Badge>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isRAGMode 
                  ? "Digite uma mensagem (será processada pela IA)..." 
                  : "Digite uma mensagem manual..."
              }
              disabled={isSending}
              className="resize-none"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!message.trim() || isSending}
            size="sm"
          >
            {isSending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {isRAGMode && (
          <p className="text-xs text-secondary-500 mt-2">
            💡 Modo RAG ativo: Suas mensagens serão processadas pela IA usando a base de conhecimento
          </p>
        )}
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: WhatsAppMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)

  const getStatusIcon = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'sent':
        return <Clock className="h-3 w-3 text-secondary-400" />
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-secondary-400" />
      case 'read':
        return <CheckCircle className="h-3 w-3 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-error-500" />
      default:
        return null
    }
  }

  const copyMessage = () => {
    navigator.clipboard.writeText(message.body)
  }

  const isFromBot = message.isFromBot
  const isOutgoing = !isFromBot

  return (
    <div 
      className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[70%] ${isOutgoing ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOutgoing
              ? 'bg-primary-500 text-white rounded-br-md'
              : isFromBot
              ? 'bg-blue-100 text-blue-900 rounded-bl-md border border-blue-200'
              : 'bg-white text-secondary-900 rounded-bl-md border border-secondary-200'
          }`}
        >
          {isFromBot && (
            <div className="flex items-center gap-1 mb-1">
              <Bot className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">RAG Bot</span>
            </div>
          )}
          
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.body}
          </p>
          
          {message.metadata?.fileName && (
            <div className="mt-2 p-2 bg-black/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="text-xs">{message.metadata.fileName}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs text-secondary-500 ${
          isOutgoing ? 'justify-end' : 'justify-start'
        }`}>
          <span>
            {format(message.timestamp, 'HH:mm', { locale: ptBR })}
          </span>
          {isOutgoing && getStatusIcon(message.status)}
        </div>
      </div>

      {/* Message Actions */}
      {showActions && (
        <div className={`flex items-center gap-1 ${
          isOutgoing ? 'order-1 mr-2' : 'order-2 ml-2'
        }`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyMessage}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
} 