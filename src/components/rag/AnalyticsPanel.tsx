'use client'

import { useState, useMemo } from 'react'
import { 
  Button, 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui'
import { useRAG } from '@/contexts/RAGContext'
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Clock,
  Star,
  RefreshCw,
  Download,
  Calendar,
  Activity
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AnalyticsPanel() {
  const { 
    conversations, 
    analytics,
    agents,
    knowledgeBase 
  } = useRAG()

  const [timeRange, setTimeRange] = useState('7d')

  // Calcular métricas em tempo real
  const metrics = useMemo(() => {
    const now = new Date()
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1
    const startDate = startOfDay(subDays(now, daysAgo))

    const filteredConversations = conversations.filter(
      conv => new Date(conv.createdAt) >= startDate
    )

    const totalConversations = filteredConversations.length
    const activeConversations = filteredConversations.filter(c => c.status === 'active').length
    const resolvedConversations = filteredConversations.filter(c => c.status === 'resolved').length
    
    // Calcular tempo médio de resposta
    const responseTimes = filteredConversations.map(conv => {
      const messages = conv.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      let totalResponseTime = 0
      let responseCount = 0

      for (let i = 1; i < messages.length; i++) {
        const prev = messages[i - 1]
        const curr = messages[i]
        
        if (!prev.isFromBot && curr.isFromBot) {
          const responseTime = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()
          totalResponseTime += responseTime
          responseCount++
        }
      }

      return responseCount > 0 ? totalResponseTime / responseCount : 0
    }).filter(time => time > 0)

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0

    // Satisfação do cliente (baseado no sentimento)
    const sentimentCounts = filteredConversations.reduce((acc, conv) => {
      if (conv.sentiment) {
        acc[conv.sentiment] = (acc[conv.sentiment] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const totalWithSentiment = Object.values(sentimentCounts).reduce((sum, count) => sum + count, 0)
    const customerSatisfaction = totalWithSentiment > 0 
      ? ((sentimentCounts.positive || 0) / totalWithSentiment) * 100 
      : 0

    return {
      totalConversations,
      activeConversations,
      resolvedConversations,
      averageResponseTime: Math.round(averageResponseTime / 1000 / 60), // em minutos
      customerSatisfaction: Math.round(customerSatisfaction)
    }
  }, [conversations, timeRange])

  // Dados para gráficos
  const chartData = useMemo(() => {
    const now = new Date()
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1
    const days = []

    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = subDays(now, i)
      const dayConversations = conversations.filter(conv => 
        format(new Date(conv.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )

      const incoming = dayConversations.reduce((sum, conv) => 
        sum + conv.messages.filter(msg => !msg.isFromBot).length, 0
      )
      
      const outgoing = dayConversations.reduce((sum, conv) => 
        sum + conv.messages.filter(msg => msg.isFromBot).length, 0
      )

      days.push({
        date: format(date, 'dd/MM'),
        incoming,
        outgoing,
        conversations: dayConversations.length
      })
    }

    return days
  }, [conversations, timeRange])

  // Top categorias
  const topCategories = useMemo(() => {
    const categoryCounts = knowledgeBase.reduce((acc, kb) => {
      acc[kb.category] = (acc[kb.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [knowledgeBase])

  // Performance dos agentes
  const agentPerformance = useMemo(() => {
    return agents.map(agent => {
      const agentConversations = conversations.filter(conv => conv.assignedAgent === agent.name)
      return {
        agentId: agent.id,
        name: agent.name,
        conversations: agentConversations.length,
        responseTime: agent.averageResponseTime,
        rating: agent.rating
      }
    })
  }, [agents, conversations])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-secondary-900">Analytics</h3>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Hoje</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Conversas"
            value={metrics.totalConversations}
            icon={<MessageSquare className="h-5 w-5" />}
            color="blue"
          />
          <MetricCard
            title="Ativas"
            value={metrics.activeConversations}
            icon={<Activity className="h-5 w-5" />}
            color="green"
          />
          <MetricCard
            title="Tempo Resp."
            value={`${metrics.averageResponseTime}min`}
            icon={<Clock className="h-5 w-5" />}
            color="orange"
          />
          <MetricCard
            title="Satisfação"
            value={`${metrics.customerSatisfaction}%`}
            icon={<Star className="h-5 w-5" />}
            color="purple"
          />
        </div>

        {/* Message Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Volume de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="incoming" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Recebidas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outgoing" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Enviadas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCategories.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-secondary-700">{item.category}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Performance */}
        {agentPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performance dos Agentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agentPerformance.map((agent) => (
                  <div key={agent.agentId} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{agent.name}</p>
                      <p className="text-xs text-secondary-600">
                        {agent.conversations} conversas • {agent.responseTime}min resp.
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm">{agent.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversations by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status das Conversas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { status: 'Ativas', count: metrics.activeConversations },
                  { status: 'Resolvidas', count: metrics.resolvedConversations },
                  { status: 'Pendentes', count: conversations.filter(c => c.status === 'pending').length },
                  { status: 'Arquivadas', count: conversations.filter(c => c.status === 'archived').length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'purple'
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50'
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-600 mb-1">{title}</p>
            <p className="text-lg font-semibold text-secondary-900">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 