'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Badge } from '@/components/ui'
import { 
  MessageSquare, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  Activity
} from 'lucide-react'
import { supabaseDataService } from '@/services/supabase-data'

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  description: string
  isLoading?: boolean
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Conversas Hoje',
      value: '0',
      change: '0%',
      changeType: 'neutral',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'vs. ontem',
      isLoading: true
    },
    {
      title: 'Mensagens Enviadas',
      value: '0',
      change: '0%',
      changeType: 'neutral',
      icon: <Activity className="h-5 w-5" />,
      description: 'últimas 24h',
      isLoading: true
    },
    {
      title: 'Taxa de Resposta',
      value: '0%',
      change: '0%',
      changeType: 'neutral',
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'média semanal',
      isLoading: true
    },
    {
      title: 'Tempo Médio',
      value: '0min',
      change: '0%',
      changeType: 'neutral',
      icon: <Clock className="h-5 w-5" />,
      description: 'de resposta',
      isLoading: true
    },
    {
      title: 'Contatos Ativos',
      value: '0',
      change: '0',
      changeType: 'neutral',
      icon: <Users className="h-5 w-5" />,
      description: 'este mês',
      isLoading: true
    },
    {
      title: 'IA Respostas',
      value: '0',
      change: '0%',
      changeType: 'neutral',
      icon: <Bot className="h-5 w-5" />,
      description: 'automáticas',
      isLoading: true
    }
  ])

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setError(null)
      const dashboardData = await supabaseDataService.getDashboardStats()

      const formatChange = (change: number): { value: string; type: 'positive' | 'negative' | 'neutral' } => {
        if (change > 0) return { value: `+${change}%`, type: 'positive' }
        if (change < 0) return { value: `${change}%`, type: 'negative' }
        return { value: '0%', type: 'neutral' }
      }

      const updatedStats: StatCard[] = [
        {
          title: 'Conversas Hoje',
          value: dashboardData.conversationsToday.value.toString(),
          change: formatChange(dashboardData.conversationsToday.change).value,
          changeType: formatChange(dashboardData.conversationsToday.change).type,
          icon: <MessageSquare className="h-5 w-5" />,
          description: 'vs. ontem',
          isLoading: false
        },
        {
          title: 'Mensagens Enviadas',
          value: dashboardData.messagesTotal.value.toLocaleString(),
          change: formatChange(dashboardData.messagesTotal.change).value,
          changeType: formatChange(dashboardData.messagesTotal.change).type,
          icon: <Activity className="h-5 w-5" />,
          description: 'últimas 24h',
          isLoading: false
        },
        {
          title: 'Taxa de Resposta',
          value: `${dashboardData.responseRate.value}%`,
          change: formatChange(dashboardData.responseRate.change).value,
          changeType: formatChange(dashboardData.responseRate.change).type,
          icon: <CheckCircle className="h-5 w-5" />,
          description: 'média semanal',
          isLoading: false
        },
        {
          title: 'Tempo Médio',
          value: `${dashboardData.avgResponseTime.value}min`,
          change: formatChange(dashboardData.avgResponseTime.change).value,
          changeType: dashboardData.avgResponseTime.change < 0 ? 'positive' : 
                     dashboardData.avgResponseTime.change > 0 ? 'negative' : 'neutral',
          icon: <Clock className="h-5 w-5" />,
          description: 'de resposta',
          isLoading: false
        },
        {
          title: 'Contatos Ativos',
          value: dashboardData.activeContacts.value.toLocaleString(),
          change: `+${dashboardData.activeContacts.change}`,
          changeType: 'positive',
          icon: <Users className="h-5 w-5" />,
          description: 'este mês',
          isLoading: false
        },
        {
          title: 'IA Respostas',
          value: dashboardData.aiResponses.value.toString(),
          change: formatChange(dashboardData.aiResponses.change).value,
          changeType: formatChange(dashboardData.aiResponses.change).type,
          icon: <Bot className="h-5 w-5" />,
          description: 'automáticas',
          isLoading: false
        }
      ]

      setStats(updatedStats)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      setError('Erro ao carregar estatísticas do dashboard')
      
      // Manter dados mockados em caso de erro
      setStats(prev => prev.map(stat => ({ ...stat, isLoading: false })))
    }
  }

  const getChangeBadgeVariant = (type: StatCard['changeType']) => {
    switch (type) {
      case 'positive':
        return 'success'
      case 'negative':
        return 'error'
      default:
        return 'secondary'
    }
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Erro ao carregar estatísticas</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={loadDashboardStats}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          variant="elevated" 
          className="hover:shadow-lg transition-all duration-300 group"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
                {stat.icon}
              </div>
              {stat.isLoading ? (
                <div className="animate-pulse bg-secondary-200 rounded px-2 py-1 w-12 h-5"></div>
              ) : (
                <Badge 
                  variant={getChangeBadgeVariant(stat.changeType) as any}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              {stat.isLoading ? (
                <>
                  <div className="animate-pulse bg-secondary-200 rounded h-8 w-16 mb-2"></div>
                  <div className="animate-pulse bg-secondary-200 rounded h-4 w-20 mb-1"></div>
                  <div className="animate-pulse bg-secondary-200 rounded h-3 w-16"></div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-secondary-900">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-secondary-700">
                    {stat.title}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {stat.description}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 