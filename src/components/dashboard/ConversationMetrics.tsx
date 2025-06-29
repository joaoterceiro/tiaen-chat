'use client'

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { TrendingUp, MessageSquare, Clock, Users } from 'lucide-react'

export function ConversationMetrics() {
  // Dados simulados para o gráfico
  const chartData = [
    { time: '00:00', messages: 12 },
    { time: '04:00', messages: 8 },
    { time: '08:00', messages: 24 },
    { time: '12:00', messages: 45 },
    { time: '16:00', messages: 38 },
    { time: '20:00', messages: 28 },
  ]

  const maxMessages = Math.max(...chartData.map(d => d.messages))

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Métricas de Conversas
          </CardTitle>
          <Badge variant="primary">Últimas 24h</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="mb-6">
          <div className="flex items-end justify-between h-32 gap-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full bg-secondary-200 rounded-t-lg relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 flex items-end justify-center pb-1"
                    style={{ 
                      height: `${(data.messages / maxMessages) * 120}px`,
                      minHeight: '20px'
                    }}
                  >
                    <span className="text-xs font-medium text-white">
                      {data.messages}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-secondary-600 mt-2">
                  {data.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
              <div className="p-2 rounded-lg bg-primary-100">
                <MessageSquare className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-secondary-900">1,847</p>
                <p className="text-sm text-secondary-600">Total de Mensagens</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-secondary-900">234</p>
                <p className="text-sm text-secondary-600">Contatos Únicos</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-secondary-900">94.2%</p>
                <p className="text-sm text-secondary-600">Taxa de Sucesso</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-secondary-900">1.8min</p>
                <p className="text-sm text-secondary-600">Tempo Médio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 pt-4 border-t border-secondary-200">
          <h4 className="font-medium text-secondary-900 mb-3">Insights</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-secondary-700">
                Pico de atividade às 12:00 com 45 mensagens
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-secondary-700">
                Tempo de resposta melhorou 15% hoje
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-secondary-700">
                IA respondeu automaticamente 68% das mensagens
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 