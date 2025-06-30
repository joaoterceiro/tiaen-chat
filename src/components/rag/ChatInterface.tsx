'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Button, 
  Input, 
  Badge, 
  Avatar,
  Spinner
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
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Message {
  id: string;
  phone_number: string;
  message: string;
  is_bot: boolean;
  metadata?: {
    sources?: {
      documents: Array<{
        id: string;
        similarity: number;
      }>;
    };
  };
  created_at: string;
}

interface Document {
  id: string;
  file_name: string;
  content: string;
}

interface ChatInterfaceProps {
  instanceId: string;
  phoneNumber: string;
}

export function ChatInterface({ instanceId, phoneNumber }: ChatInterfaceProps) {
  const { 
    activeConversation, 
    sendMessage: sendMessageToRAG,
    sendRAGResponse,
    isSending,
    currentAgent,
    refreshConversations
  } = useRAG()

  const [newMessage, setNewMessage] = useState('')
  const [expandedSources, setExpandedSources] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Atualizar mensagens periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      refreshConversations()
    }, 3000) // Atualizar a cada 3 segundos

    return () => clearInterval(interval)
  }, [refreshConversations])

  // Atualizar quando mudar de conversa
  useEffect(() => {
    refreshConversations()
  }, [instanceId, phoneNumber])

  // Rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    try {
      await sendMessageToRAG(phoneNumber, newMessage)
      setNewMessage('')
      await refreshConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const toggleSource = (messageId: string) => {
    setExpandedSources(expanded =>
      expanded.includes(messageId)
        ? expanded.filter(id => id !== messageId)
        : [...expanded, messageId]
    )
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
        {activeConversation.messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.is_bot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`
                max-w-[80%] rounded-lg p-3 space-y-2
                ${message.is_bot
                  ? 'bg-gray-100'
                  : 'bg-primary text-white'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.is_bot ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="text-xs opacity-70">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>

              <p className="text-sm whitespace-pre-wrap">{message.message}</p>

              {message.is_bot && message.metadata?.sources?.documents && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => toggleSource(message.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <FileText className="h-3 w-3" />
                    {expandedSources.includes(message.id) ? (
                      <>
                        <span>Ocultar fontes</span>
                        <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        <span>Ver fontes ({message.metadata.sources.documents.length})</span>
                        <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>

                  {expandedSources.includes(message.id) && (
                    <div className="mt-2 space-y-2">
                      {message.metadata.sources.documents.map((doc: any) => (
                        <div key={doc.id} className="text-xs bg-white p-2 rounded border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{doc.file_name}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {Math.round(doc.similarity * 100)}% relevante
                            </Badge>
                          </div>
                          <p className="text-gray-600 line-clamp-2">{doc.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4 border-t border-secondary-200 bg-white">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
        />
        <Button 
          type="submit"
          variant="primary"
          disabled={isSending || !newMessage.trim()}
        >
          {isSending ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Enviando...</span>
            </div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
} 