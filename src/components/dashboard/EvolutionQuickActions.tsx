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

  return (
    <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Evolution API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Botão principal */}
          <Button asChild className="w-full">
            <Link href="/evolution">
              <Plus className="h-4 w-4 mr-2" />
              Nova Instância WhatsApp
            </Link>
          </Button>

          {/* Status das instâncias */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-700">Instâncias Recentes</h4>
            {loading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : instances.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-secondary-600">Nenhuma instância encontrada</p>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href="/evolution">
                    Criar Primeira Instância
                  </Link>
                </Button>
              </div>
            ) : (
              instances.map((instance, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary-50">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(instance.status)}
                    <span className="text-sm font-medium">{instance.name}</span>
                    {instance.aiEnabled && (
                      <Badge variant="info" className="text-xs">IA</Badge>
                    )}
                  </div>
                  <Badge variant={getStatusColor(instance.status)} className="text-xs">
                    {instance.status === 'connected' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {/* Ações rápidas */}
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/evolution">
                <Settings className="h-3 w-3 mr-1" />
                Gerenciar
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/evolution">
                <QrCode className="h-3 w-3 mr-1" />
                QR Code
              </Link>
            </Button>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-secondary-200">
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
      </CardContent>
    </Card>
  )
}
