'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge,
  Spinner
} from '@/components/ui'
import { 
  Smartphone, 
  Plus, 
  Wifi, 
  WifiOff,
  Settings,
  QrCode
} from 'lucide-react'

interface InstanceStatus {
  name: string
  status: 'connected' | 'disconnected' | 'connecting'
  aiEnabled: boolean
}

export function EvolutionQuickActions() {
  const [instances, setInstances] = useState<InstanceStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInstances()
  }, [])

  const loadInstances = async () => {
    try {
      const response = await fetch('/api/evolution/instances')
      if (response.ok) {
        const data = await response.json()
        const mappedInstances = data.slice(0, 3).map((instance: any) => ({
          name: instance.instance_name,
          status: instance.status === 'open' ? 'connected' : 'disconnected',
          aiEnabled: instance.ai_enabled
        }))
        setInstances(mappedInstances)
      }
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-3 w-3 text-green-600" />
      case 'connecting':
        return <Spinner size="sm" />
      default:
        return <WifiOff className="h-3 w-3 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success'
      case 'connecting': return 'warning'
      default: return 'error'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Online'
      case 'connecting': return 'Conectando'
      default: return 'Offline'
    }
  }

  return (
    <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Evolution API
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Botão principal */}
          <Button asChild className="w-full">
            <Link href="/evolution">
              <Plus className="h-4 w-4 mr-2" />
              Nova Instância WhatsApp
            </Link>
          </Button>

          {/* Status das instâncias */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-secondary-700">Instâncias Recentes</h4>
            {loading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : instances.length === 0 ? (
              <div className="text-center py-4 px-3 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary-600 mb-2">Nenhuma instância encontrada</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/evolution">
                    Criar Primeira Instância
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {instances.map((instance, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(instance.status)}
                      <span className="text-sm font-medium truncate">{instance.name}</span>
                      {instance.aiEnabled && (
                        <Badge variant="info" className="text-xs flex-shrink-0">IA</Badge>
                      )}
                    </div>
                    <Badge variant={getStatusColor(instance.status)} className="text-xs flex-shrink-0">
                      {getStatusText(instance.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-700">Ações Rápidas</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild size="sm" variant="outline" className="h-auto p-2">
                <Link href="/evolution">
                  <div className="flex flex-col items-center gap-1">
                    <Settings className="h-3 w-3" />
                    <span className="text-xs">Gerenciar</span>
                  </div>
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="h-auto p-2">
                <Link href="/evolution">
                  <div className="flex flex-col items-center gap-1">
                    <QrCode className="h-3 w-3" />
                    <span className="text-xs">QR Code</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="border-t border-secondary-200 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-secondary-900">{instances.length}</p>
                <p className="text-xs text-secondary-600">Instâncias</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {instances.filter(i => i.status === 'connected').length}
                </p>
                <p className="text-xs text-secondary-600">Conectadas</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
