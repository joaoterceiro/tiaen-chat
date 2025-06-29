'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { evolutionService } from '@/services/evolution'
import { Smartphone, Plus, Settings, Zap, Wifi, WifiOff, Trash2, QrCode } from 'lucide-react'

interface Instance {
  instanceName: string
  status: 'open' | 'close' | 'connecting'
  serverUrl?: string
  apikey?: string
  webhookUrl?: string
  qrcode?: string
  aiEnabled?: boolean
  autoResponse?: boolean
  welcomeMessage?: string
}

export default function EvolutionPage() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [newInstance, setNewInstance] = useState({
    name: '',
    token: '',
    aiEnabled: true,
    autoResponse: true,
    welcomeMessage: 'Olá! Como posso ajudá-lo hoje?'
  })

  useEffect(() => {
    loadInstances()
  }, [])

  const loadInstances = async () => {
    try {
      setLoading(true)
      const data = await evolutionService.getInstances()
      setInstances(data)
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error)
    } finally {
      setLoading(false)
    }
  }

  const createInstance = async () => {
    try {
      setLoading(true)
      
      // Criar instância na Evolution API
      await evolutionService.createInstance({
        instanceName: newInstance.name,
        token: newInstance.token,
        qrcode: true,
        webhook: `${window.location.origin}/api/rag/webhook`,
        webhookByEvents: false,
        webhookBase64: false,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED',
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'MESSAGES_DELETE',
          'SEND_MESSAGE',
          'CONTACTS_SET',
          'CONTACTS_UPSERT',
          'CONTACTS_UPDATE',
          'PRESENCE_UPDATE',
          'CHATS_SET',
          'CHATS_UPSERT',
          'CHATS_UPDATE',
          'CHATS_DELETE',
          'GROUPS_UPSERT',
          'GROUP_UPDATE',
          'GROUP_PARTICIPANTS_UPDATE',
          'CONNECTION_UPDATE',
          'CALL',
          'NEW_JWT_TOKEN'
        ]
      })

      // Configurar webhook
      await evolutionService.setWebhook(newInstance.name, {
        url: `${window.location.origin}/api/rag/webhook`,
        enabled: true,
        events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']
      })

      // Salvar configuração no banco
      await fetch('/api/evolution/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: newInstance.name,
          aiEnabled: newInstance.aiEnabled,
          autoResponse: newInstance.autoResponse,
          welcomeMessage: newInstance.welcomeMessage
        })
      })

      setShowCreateModal(false)
      setNewInstance({
        name: '',
        token: '',
        aiEnabled: true,
        autoResponse: true,
        welcomeMessage: 'Olá! Como posso ajudá-lo hoje?'
      })
      
      await loadInstances()
    } catch (error) {
      console.error('Erro ao criar instância:', error)
      alert('Erro ao criar instância. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const connectInstance = async (instanceName: string) => {
    try {
      setLoading(true)
      const response = await evolutionService.connectInstance(instanceName)
      
      if (response.qrcode) {
        setQrCode(response.qrcode)
        setSelectedInstance(instances.find(i => i.instanceName === instanceName) || null)
        setShowConfigModal(true)
      }
      
      await loadInstances()
    } catch (error) {
      console.error('Erro ao conectar instância:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteInstance = async (instanceName: string) => {
    if (!confirm('Tem certeza que deseja excluir esta instância?')) return

    try {
      setLoading(true)
      await evolutionService.deleteInstance(instanceName)
      await loadInstances()
    } catch (error) {
      console.error('Erro ao excluir instância:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateInstanceConfig = async (instanceName: string, config: any) => {
    try {
      await fetch('/api/evolution/instances', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName,
          ...config
        })
      })
      
      await loadInstances()
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'success'
      case 'connecting': return 'warning'
      default: return 'error'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Conectado'
      case 'connecting': return 'Conectando'
      default: return 'Desconectado'
    }
  }

  return (
    <PageContainer
      title="Evolution API"
      description="Gerencie suas instâncias do WhatsApp e configure a integração com IA"
    >
      <div className="space-y-6">
        {/* Header com botão de criar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Instâncias WhatsApp</h2>
          </div>
          
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Instância
          </Button>
        </div>

        {/* Alert de configuração */}
        <Alert type="info">
          <div className="flex items-start gap-2">
            <Settings className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Configuração da Evolution API</p>
              <p className="text-sm text-gray-600 mt-1">
                Certifique-se de que sua Evolution API está rodando em: <code className="bg-gray-100 px-1 rounded">https://evolution.x5fx16.easypanel.host/</code>
              </p>
            </div>
          </div>
        </Alert>

        {/* Lista de instâncias */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-4">
            {instances.length === 0 ? (
              <Card className="p-8 text-center">
                <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma instância encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie sua primeira instância do WhatsApp para começar
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Instância
                </Button>
              </Card>
            ) : (
              instances.map((instance) => (
                <Card key={instance.instanceName} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {instance.status === 'open' ? (
                          <Wifi className="w-5 h-5 text-green-600" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <h3 className="font-medium">{instance.instanceName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getStatusColor(instance.status)}>
                              {getStatusText(instance.status)}
                            </Badge>
                            {instance.aiEnabled && (
                              <Badge variant="info">
                                <Zap className="w-3 h-3 mr-1" />
                                IA Ativa
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {instance.status === 'close' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => connectInstance(instance.instanceName)}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Conectar
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInstance(instance)
                          setShowConfigModal(true)
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteInstance(instance.instanceName)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de criar instância */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Instância WhatsApp"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome da Instância
            </label>
            <Input
              value={newInstance.name}
              onChange={(e) => setNewInstance(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: atendimento, vendas, suporte"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Token (Opcional)
            </label>
            <Input
              value={newInstance.token}
              onChange={(e) => setNewInstance(prev => ({ ...prev, token: e.target.value }))}
              placeholder="Token personalizado"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Ativar IA</label>
              <Switch
                checked={newInstance.aiEnabled}
                onCheckedChange={(checked) => 
                  setNewInstance(prev => ({ ...prev, aiEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Resposta Automática</label>
              <Switch
                checked={newInstance.autoResponse}
                onCheckedChange={(checked) => 
                  setNewInstance(prev => ({ ...prev, autoResponse: checked }))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mensagem de Boas-vindas
            </label>
            <Input
              value={newInstance.welcomeMessage}
              onChange={(e) => setNewInstance(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              placeholder="Mensagem enviada no primeiro contato"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={createInstance}
              disabled={!newInstance.name || loading}
            >
              {loading ? <Spinner size="sm" /> : 'Criar Instância'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de configuração */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false)
          setQrCode('')
          setSelectedInstance(null)
        }}
        title={selectedInstance ? `Configurar ${selectedInstance.instanceName}` : 'Configuração'}
        size="lg"
      >
        {selectedInstance && (
          <Tabs defaultValue="connection">
            <div className="space-y-6">
              {/* QR Code */}
              {qrCode && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Escaneie o QR Code</h3>
                  <img 
                    src={qrCode} 
                    alt="QR Code" 
                    className="mx-auto max-w-xs"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Use o WhatsApp para escanear este código
                  </p>
                </div>
              )}

              {/* Configurações da IA */}
              <div className="space-y-4">
                <h3 className="font-medium">Configurações da IA</h3>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ativar IA</label>
                  <Switch
                    checked={selectedInstance.aiEnabled}
                    onCheckedChange={(checked) => 
                      updateInstanceConfig(selectedInstance.instanceName, { aiEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Resposta Automática</label>
                  <Switch
                    checked={selectedInstance.autoResponse}
                    onCheckedChange={(checked) => 
                      updateInstanceConfig(selectedInstance.instanceName, { autoResponse: checked })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mensagem de Boas-vindas
                  </label>
                  <Input
                    value={selectedInstance.welcomeMessage || ''}
                    onChange={(e) => 
                      updateInstanceConfig(selectedInstance.instanceName, { welcomeMessage: e.target.value })
                    }
                    placeholder="Mensagem enviada no primeiro contato"
                  />
                </div>
              </div>

              {/* Status da conexão */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Status da Conexão</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(selectedInstance.status)}>
                    {getStatusText(selectedInstance.status)}
                  </Badge>
                  {selectedInstance.webhookUrl && (
                    <Badge variant="success">Webhook Configurado</Badge>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        )}
      </Modal>
    </PageContainer>
  )
} 