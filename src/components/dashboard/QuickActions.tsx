'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Input,
  Textarea
} from '@/components/ui'
import { 
  Plus, 
  Bot, 
  Users, 
  Zap, 
  BarChart3, 
  Settings,
  MessageSquare
} from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  variant: 'primary' | 'outline'
  badge?: string
}

export function QuickActions() {
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false)
  const [conversationData, setConversationData] = useState({
    phone: '',
    name: '',
    message: ''
  })

  const handleCreateConversation = () => {
    setIsCreatingConversation(true)
    setIsNewConversationModalOpen(true)
  }

  const handleSaveConversation = async () => {
    try {
      // Aqui você implementaria a criação da conversa
      console.log('Criando conversa:', conversationData)
      
      // Simular criação
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsNewConversationModalOpen(false)
      setConversationData({ phone: '', name: '', message: '' })
      setIsCreatingConversation(false)
      
      // Redirecionar para a página de conversas
      window.location.href = '/conversas'
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      setIsCreatingConversation(false)
    }
  }

  const actions: QuickAction[] = [
    {
      title: 'Nova Conversa',
      description: 'Iniciar conversa manual',
      icon: <Plus className="h-4 w-4" />,
      variant: 'primary',
      onClick: handleCreateConversation
    },
    {
      title: 'Chat WhatsApp',
      description: 'Ver conversas ativas',
      icon: <MessageSquare className="h-4 w-4" />,
      href: '/conversas',
      variant: 'outline',
      badge: '12'
    },
    {
      title: 'Sistema RAG',
      description: 'Configurar IA',
      icon: <Bot className="h-4 w-4" />,
      href: '/rag',
      variant: 'outline',
      badge: 'IA'
    },
    {
      title: 'Contatos',
      description: 'Gerenciar contatos',
      icon: <Users className="h-4 w-4" />,
      href: '/contacts',
      variant: 'outline'
    },
    {
      title: 'Automações',
      description: 'Criar regras',
      icon: <Zap className="h-4 w-4" />,
      href: '/rag?tab=automation',
      variant: 'outline'
    },
    {
      title: 'Relatórios',
      description: 'Ver analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/analytics',
      variant: 'outline'
    },
    {
      title: 'Configurações',
      description: 'Ajustar sistema',
      icon: <Settings className="h-4 w-4" />,
      href: '/rag?tab=configuration',
      variant: 'outline'
    }
  ]

  const handleAction = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick()
    }
  }

  return (
    <>
      <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {actions.map((action, index) => (
              <div key={index}>
                {action.href ? (
                  <Button asChild variant={action.variant as any} className="w-full justify-start h-auto p-3">
                    <Link href={action.href}>
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 rounded-lg bg-secondary-100">
                          {action.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{action.title}</p>
                            {action.badge && (
                              <Badge variant="primary" className="text-xs">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-secondary-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant={action.variant as any}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleAction(action)}
                    disabled={action.title === 'Nova Conversa' && isCreatingConversation}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-secondary-100">
                        {action.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{action.title}</p>
                          {action.badge && (
                            <Badge variant="primary" className="text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-secondary-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Status Indicators */}
          <div className="border-t border-secondary-200 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Status do Sistema</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">WhatsApp</span>
                <Badge variant="success">Conectado</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">IA Assistant</span>
                <Badge variant="success">Ativo</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova Conversa */}
      <Modal open={isNewConversationModalOpen} onClose={() => setIsNewConversationModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Nova Conversa
            </ModalTitle>
            <ModalDescription>
              Inicie uma nova conversa manual com um contato
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Telefone *
                </label>
                <Input
                  value={conversationData.phone}
                  onChange={(e) => setConversationData({ ...conversationData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  type="tel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nome do Contato
                </label>
                <Input
                  value={conversationData.name}
                  onChange={(e) => setConversationData({ ...conversationData, name: e.target.value })}
                  placeholder="Nome (opcional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Mensagem Inicial
              </label>
              <Textarea
                value={conversationData.message}
                onChange={(e) => setConversationData({ ...conversationData, message: e.target.value })}
                placeholder="Digite a primeira mensagem..."
                rows={3}
              />
              <p className="text-xs text-secondary-500 mt-1">
                Esta mensagem será enviada automaticamente para iniciar a conversa
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsNewConversationModalOpen(false)}
              disabled={isCreatingConversation}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveConversation}
              disabled={!conversationData.phone.trim() || isCreatingConversation}
            >
              {isCreatingConversation ? 'Criando...' : 'Iniciar Conversa'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
} 