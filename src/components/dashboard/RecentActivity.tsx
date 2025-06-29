'use client'

import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar } from '@/components/ui'
import { 
  Clock, 
  MessageSquare, 
  Bot, 
  User, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Settings
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Activity {
  id: string
  type: 'message' | 'bot_response' | 'contact_added' | 'automation' | 'system'
  title: string
  description: string
  timestamp: Date
  user?: string
  status?: 'success' | 'warning' | 'error'
  metadata?: Record<string, any>
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'message',
    title: 'Nova mensagem recebida',
    description: 'João Silva enviou: "Preciso de ajuda com meu pedido"',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    user: 'João Silva',
    status: 'success'
  },
  {
    id: '2',
    type: 'bot_response',
    title: 'IA respondeu automaticamente',
    description: 'Resposta automática enviada sobre horário de funcionamento',
    timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 min ago
    status: 'success'
  },
  {
    id: '3',
    type: 'contact_added',
    title: 'Novo contato adicionado',
    description: 'Maria Santos foi adicionada aos contatos',
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 min ago
    user: 'Maria Santos',
    status: 'success'
  },
  {
    id: '4',
    type: 'automation',
    title: 'Automação executada',
    description: 'Regra "Saudação inicial" foi ativada para novo contato',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    status: 'success'
  },
  {
    id: '5',
    type: 'message',
    title: 'Mensagem não entregue',
    description: 'Falha ao entregar mensagem para +55 11 99999-9999',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    status: 'error'
  },
  {
    id: '6',
    type: 'system',
    title: 'Sistema atualizado',
    description: 'Base de conhecimento atualizada com 3 novos itens',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'success'
  }
]

export function RecentActivity() {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'bot_response':
        return <Bot className="h-4 w-4" />
      case 'contact_added':
        return <User className="h-4 w-4" />
      case 'automation':
        return <Settings className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: Activity['type'], status?: Activity['status']) => {
    if (status === 'error') return 'text-red-600 bg-red-100'
    if (status === 'warning') return 'text-yellow-600 bg-yellow-100'
    
    switch (type) {
      case 'message':
        return 'text-blue-600 bg-blue-100'
      case 'bot_response':
        return 'text-purple-600 bg-purple-100'
      case 'contact_added':
        return 'text-green-600 bg-green-100'
      case 'automation':
        return 'text-primary-600 bg-primary-100'
      case 'system':
        return 'text-secondary-600 bg-secondary-100'
      default:
        return 'text-secondary-600 bg-secondary-100'
    }
  }

  const getStatusBadge = (status?: Activity['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" className="text-xs">Sucesso</Badge>
      case 'warning':
        return <Badge variant="warning" className="text-xs">Atenção</Badge>
      case 'error':
        return <Badge variant="error" className="text-xs">Erro</Badge>
      default:
        return null
    }
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            Atividades Recentes
          </CardTitle>
          <Badge variant="secondary">Últimas 24h</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type, activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-secondary-900 truncate">
                    {activity.title}
                  </h4>
                  {getStatusBadge(activity.status)}
                </div>
                
                <p className="text-sm text-secondary-600 mb-2">
                  {activity.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-secondary-500">
                  <span>
                    {formatDistanceToNow(activity.timestamp, { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                  {activity.user && (
                    <div className="flex items-center gap-1">
                      <Avatar size="sm" fallback={activity.user.charAt(0)} />
                      <span>{activity.user}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        <div className="mt-4 pt-4 border-t border-secondary-200 text-center">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver todas as atividades
          </button>
        </div>
      </CardContent>
    </Card>
  )
} 