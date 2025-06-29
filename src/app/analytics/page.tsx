'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription
} from '@/components/ui'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  MessageSquare,
  Clock,
  Users,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { supabaseDataService } from '@/services/supabase-data'
import { Database } from '@/types/database'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Recharts imports
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

type DailyMetric = Database['public']['Tables']['daily_metrics']['Row']

interface AnalyticsData {
  totalConversations: number
  totalMessages: number
  avgResponseTime: number
  satisfactionRate: number
  conversationsByDay: Array<{ date: string; count: number }>
  messagesByDay: Array<{ date: string; count: number }>
  responseTimeByDay: Array<{ date: string; avgTime: number }>
}

const PERIOD_OPTIONS = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '15', label: 'Últimos 15 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' }
]

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState('30')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const days = parseInt(period)
      const endDate = endOfDay(new Date())
      const startDate = startOfDay(subDays(endDate, days - 1))

      // Buscar métricas diárias
      const metrics = await supabaseDataService.getDailyMetrics(
        startDate.toISOString(),
        endDate.toISOString()
      )

      // Processar dados para gráficos
      const conversationsByDay = metrics.map(m => ({
        date: format(new Date(m.date), 'dd/MM', { locale: ptBR }),
        count: m.total_conversations
      }))

      const messagesByDay = metrics.map(m => ({
        date: format(new Date(m.date), 'dd/MM', { locale: ptBR }),
        count: m.total_messages
      }))

      const responseTimeByDay = metrics.map(m => ({
        date: format(new Date(m.date), 'dd/MM', { locale: ptBR }),
        avgTime: m.average_response_time_seconds / 60 // Convert to minutes
      }))

      // Calcular totais
      const totalConversations = metrics.reduce((sum, m) => sum + m.total_conversations, 0)
      const totalMessages = metrics.reduce((sum, m) => sum + m.total_messages, 0)
      const avgResponseTime = metrics.reduce((sum, m) => sum + (m.average_response_time_seconds / 60), 0) / metrics.length || 0
      const satisfactionRate = metrics.reduce((sum, m) => sum + (m.customer_satisfaction || 0), 0) / metrics.length || 0

      setData({
        totalConversations,
        totalMessages,
        avgResponseTime,
        satisfactionRate,
        conversationsByDay,
        messagesByDay,
        responseTimeByDay
      })
    } catch (err) {
      console.error('Erro ao carregar analytics:', err)
      setError('Erro ao carregar dados de analytics')
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  const exportToCsv = () => {
    if (!data) return

    const csvContent = [
      ['Data', 'Conversas', 'Mensagens', 'Tempo Resposta (min)'],
      ...data.conversationsByDay.map((item, index) => [
        item.date,
        item.count,
        data.messagesByDay[index]?.count || 0,
        data.responseTimeByDay[index]?.avgTime?.toFixed(1) || 0
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${period}-dias.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatPercentage = (num: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'percent', 
      minimumFractionDigits: 1 
    }).format(num / 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Link>
                </Button>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900">Analytics</h1>
              </div>
              <Badge variant="success">Carregando...</Badge>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-secondary-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-secondary-900">Analytics</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToCsv} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                Dashboard Analytics 📊
              </h1>
              <p className="text-secondary-600">
                Acompanhe o desempenho das suas conversas e mensagens
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {data && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Conversations */}
              <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">Total Conversas</p>
                      <p className="text-3xl font-bold text-secondary-900 mt-2">
                        {formatNumber(data.totalConversations)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
                    <span className="text-sm text-secondary-500 ml-2">vs período anterior</span>
                  </div>
                </CardContent>
              </Card>

              {/* Total Messages */}
              <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">Total Mensagens</p>
                      <p className="text-3xl font-bold text-secondary-900 mt-2">
                        {formatNumber(data.totalMessages)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8.3%</span>
                    <span className="text-sm text-secondary-500 ml-2">vs período anterior</span>
                  </div>
                </CardContent>
              </Card>

              {/* Average Response Time */}
              <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">Tempo Médio Resposta</p>
                      <p className="text-3xl font-bold text-secondary-900 mt-2">
                        {data.avgResponseTime.toFixed(1)}min
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">-15.2%</span>
                    <span className="text-sm text-secondary-500 ml-2">vs período anterior</span>
                  </div>
                </CardContent>
              </Card>

              {/* Satisfaction Rate */}
              <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">Taxa Satisfação</p>
                      <p className="text-3xl font-bold text-secondary-900 mt-2">
                        {formatPercentage(data.satisfactionRate)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+5.7%</span>
                    <span className="text-sm text-secondary-500 ml-2">vs período anterior</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Conversations Chart */}
              <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    Conversas por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {data.conversationsByDay.map((item, index) => {
                      const maxValue = Math.max(...data.conversationsByDay.map(d => d.count))
                      const height = (item.count / maxValue) * 100
                      
                      return (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer relative group min-h-[4px]"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${item.date}: ${item.count} conversas`}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-secondary-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {item.count} conversas
                            </div>
                          </div>
                          <span className="text-xs text-secondary-600 text-center">{item.date}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Messages Chart */}
              <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    Mensagens por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {data.messagesByDay.map((item, index) => {
                      const maxValue = Math.max(...data.messagesByDay.map(d => d.count))
                      const height = (item.count / maxValue) * 100
                      
                      return (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1">
                          <div 
                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md hover:from-green-600 hover:to-green-500 transition-colors cursor-pointer relative group min-h-[4px]"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${item.date}: ${item.count} mensagens`}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-secondary-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {item.count} mensagens
                            </div>
                          </div>
                          <span className="text-xs text-secondary-600 text-center">{item.date}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Response Time Chart */}
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  Tempo de Resposta por Dia (minutos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {data.responseTimeByDay.map((item, index) => {
                    const maxValue = Math.max(...data.responseTimeByDay.map(d => d.avgTime))
                    const height = (item.avgTime / maxValue) * 100
                    
                    return (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-md hover:from-orange-600 hover:to-orange-500 transition-colors cursor-pointer relative group min-h-[4px]"
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={`${item.date}: ${item.avgTime.toFixed(1)} min`}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-secondary-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {item.avgTime.toFixed(1)} min
                          </div>
                        </div>
                        <span className="text-xs text-secondary-600 text-center">{item.date}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card variant="elevated" className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  Resumo do Período ({PERIOD_OPTIONS.find(p => p.value === period)?.label})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(data.totalConversations)}</p>
                    <p className="text-sm text-blue-700">Conversas Totais</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatNumber(data.totalMessages)}</p>
                    <p className="text-sm text-green-700">Mensagens Totais</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{data.avgResponseTime.toFixed(1)}min</p>
                    <p className="text-sm text-orange-700">Tempo Médio</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{formatPercentage(data.satisfactionRate)}</p>
                    <p className="text-sm text-purple-700">Satisfação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
} 