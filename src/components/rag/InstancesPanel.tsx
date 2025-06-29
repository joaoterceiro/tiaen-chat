'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Button, 
  Input, 
  Badge,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Alert,
  AlertDescription
} from '@/components/ui'
import { useRAG } from '@/contexts/RAGContext'
import { EvolutionInstance } from '@/types/rag'
import { 
  Plus, 
  Phone, 
  QrCode, 
  Power,
  PowerOff,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
  Copy,
  ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function InstancesPanel() {
  const { 
    instances, 
    activeInstance,
    createInstance, 
    connectInstance, 
    disconnectInstance,
    refreshInstances,
    isLoading,
    isConnecting 
  } = useRAG()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [qrCodeInstance, setQrCodeInstance] = useState<EvolutionInstance | null>(null)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-secondary-900">Instâncias</h3>
            <p className="text-xs text-secondary-600">
              {instances.length} instância(s)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshInstances}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
              <ModalTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Instância
                </Button>
              </ModalTrigger>
              <CreateInstanceForm 
                onSubmit={async (name) => {
                  await createInstance(name)
                  setIsCreateModalOpen(false)
                }}
                onCancel={() => setIsCreateModalOpen(false)}
                isLoading={isLoading}
              />
            </Modal>
          </div>
        </div>
      </div>

      {/* Instances List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary-500">
            <Phone className="h-12 w-12 mb-2" />
            <p className="text-sm">Nenhuma instância criada</p>
            <p className="text-xs">Crie uma instância para começar</p>
          </div>
        ) : (
          instances.map((instance) => (
            <InstanceItem
              key={instance.id}
              instance={instance}
              isActive={activeInstance?.id === instance.id}
              onConnect={connectInstance}
              onDisconnect={disconnectInstance}
              onShowQR={setQrCodeInstance}
              isConnecting={isConnecting}
            />
          ))
        )}
      </div>

      {/* QR Code Modal */}
      {qrCodeInstance && (
        <Modal open={true} onClose={() => setQrCodeInstance(null)}>
          <QRCodeModal 
            instance={qrCodeInstance}
            onClose={() => setQrCodeInstance(null)}
          />
        </Modal>
      )}
    </div>
  )
}

interface InstanceItemProps {
  instance: EvolutionInstance
  isActive: boolean
  onConnect: (instanceName: string) => Promise<void>
  onDisconnect: (instanceName: string) => Promise<void>
  onShowQR: (instance: EvolutionInstance) => void
  isConnecting: boolean
}

function InstanceItem({ 
  instance, 
  isActive, 
  onConnect, 
  onDisconnect, 
  onShowQR,
  isConnecting 
}: InstanceItemProps) {
  const getStatusColor = (status: EvolutionInstance['status']) => {
    switch (status) {
      case 'connected': return 'success'
      case 'connecting': return 'warning'
      case 'disconnected': return 'secondary'
      case 'error': return 'error'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: EvolutionInstance['status']) => {
    switch (status) {
      case 'connected': return <Wifi className="h-4 w-4" />
      case 'connecting': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'disconnected': return <WifiOff className="h-4 w-4" />
      case 'error': return <WifiOff className="h-4 w-4" />
      default: return <WifiOff className="h-4 w-4" />
    }
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${isActive ? 'border-primary-200 bg-primary-50' : 'border-secondary-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-secondary-900 truncate">
              {instance.name}
            </h4>
            {isActive && (
              <Badge variant="primary" className="text-xs">
                Ativa
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(instance.status) as any} className="text-xs flex items-center gap-1">
              {getStatusIcon(instance.status)}
              {instance.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Instance Info */}
      {instance.phone && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-secondary-400" />
            <span className="text-secondary-600">{instance.phone}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => instance.phone && navigator.clipboard.writeText(instance.phone)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {instance.status === 'disconnected' && (
          <>
            <Button
              size="sm"
              onClick={() => onConnect(instance.name)}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Power className="h-3 w-3 mr-1" />
                  Conectar
                </>
              )}
            </Button>
            {instance.qrCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowQR(instance)}
              >
                <QrCode className="h-3 w-3" />
              </Button>
            )}
          </>
        )}

        {instance.status === 'connected' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDisconnect(instance.name)}
            className="flex-1"
          >
            <PowerOff className="h-3 w-3 mr-1" />
            Desconectar
          </Button>
        )}

        {instance.status === 'connecting' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowQR(instance)}
            className="flex-1"
          >
            <QrCode className="h-3 w-3 mr-1" />
            Ver QR Code
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-secondary-100 text-xs text-secondary-500">
        <div className="flex items-center justify-between">
          <span>
            Criada: {format(new Date(instance.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
          {instance.lastConnection && (
            <span>
              Última conexão: {format(new Date(instance.lastConnection), 'dd/MM HH:mm', { locale: ptBR })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface CreateInstanceFormProps {
  onSubmit: (name: string) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

function CreateInstanceForm({ onSubmit, onCancel, isLoading }: CreateInstanceFormProps) {
  const [instanceName, setInstanceName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instanceName.trim()) return
    await onSubmit(instanceName.trim())
  }

  return (
    <>
      <ModalHeader>
        <ModalTitle>Nova Instância</ModalTitle>
        <ModalDescription>
          Crie uma nova instância Evolution API para conectar ao WhatsApp.
        </ModalDescription>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Nome da Instância
          </label>
          <Input
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            placeholder="Ex: minha-empresa-bot"
            required
            pattern="^[a-zA-Z0-9_-]+$"
            title="Use apenas letras, números, _ e -"
          />
          <p className="text-xs text-secondary-500 mt-1">
            Use apenas letras, números, underscore (_) e hífen (-)
          </p>
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || !instanceName.trim()}>
            {isLoading ? 'Criando...' : 'Criar Instância'}
          </Button>
        </ModalFooter>
      </form>
    </>
  )
}

interface QRCodeModalProps {
  instance: EvolutionInstance
  onClose: () => void
}

function QRCodeModal({ instance, onClose }: QRCodeModalProps) {
  const copyQRCode = () => {
    if (instance.qrCode) {
      navigator.clipboard.writeText(instance.qrCode)
    }
  }

  return (
    <>
      <ModalHeader>
        <ModalTitle>QR Code - {instance.name}</ModalTitle>
        <ModalDescription>
          Escaneie este QR Code com o WhatsApp para conectar a instância.
        </ModalDescription>
      </ModalHeader>

      <div className="space-y-4">
        {instance.qrCode ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-secondary-200">
              <Image 
                src={instance.qrCode} 
                alt="QR Code"
                width={256}
                height={256}
                className="w-64 h-64"
              />
            </div>
            
            <Alert variant="info">
              <AlertDescription>
                1. Abra o WhatsApp no seu celular<br/>
                2. Vá em Configurações → Aparelhos conectados<br/>
                3. Toque em &quot;Conectar um aparelho&quot;<br/>
                4. Escaneie este QR Code
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={copyQRCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar QR Code
              </Button>
              <Button variant="ghost" onClick={() => window.open(instance.qrCode, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir em nova aba
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 py-8">
            <RefreshCw className="h-12 w-12 animate-spin text-secondary-400" />
            <p className="text-secondary-600">Gerando QR Code...</p>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button onClick={onClose}>Fechar</Button>
      </ModalFooter>
    </>
  )
} 