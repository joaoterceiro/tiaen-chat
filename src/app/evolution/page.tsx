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
import { Textarea } from '@/components/ui/Textarea'
import { evolutionService } from '@/services/evolution'
import { Smartphone, Plus, Settings, Zap, Wifi, WifiOff, Trash2, QrCode, RefreshCw, Copy, CheckCircle, AlertCircle, Info } from 'lucide-react'

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
  phone?: string
  profilePictureUrl?: string
  lastConnection?: string
}

export default function EvolutionPage() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newInstance, setNewInstance] = useState({
    name: '',
    token: '',
    aiEnabled: true,
    autoResponse: true,
    welcomeMessage: 'Olá! Como posso ajudá-lo hoje?'
  })

  useEffect(() => {
    // Inicializar o evolutionService
    evolutionService.initialize({
      baseUrl: process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'https://evolution.x5fx16.easypanel.host',
      apiKey: process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '2A469B9BD3CBFE8BF18D11569196F',
      webhook: `${window.location.origin}/api/rag/webhook`
    })
    
    loadInstances()
  }, [])

  const loadInstances = async () => {
    try {
      setLoading(true)
      
      // Buscar instâncias da Evolution API
      const evolutionInstances = await evolutionService.getInstances()
      
      // Buscar configurações do banco
      const response = await fetch('/api/evolution/instances')
      const dbInstances = response.ok ? await response.json() : []
      
      // Combinar dados
      const combinedInstances = evolutionInstances.map(evInstance => {
        const dbInstance = dbInstances.find((db: any) => db.instance_name === evInstance.name)
        return {
          instanceName: evInstance.name,
          status: evInstance.status === 'connected' ? 'open' : 'close',
          aiEnabled: dbInstance?.ai_enabled ?? true,
          autoResponse: dbInstance?.auto_response ?? true,
          welcomeMessage: dbInstance?.welcome_message ?? 'Olá! Como posso ajudá-lo hoje?',
          webhookUrl: evInstance.webhook,
          phone: evInstance.phone,
          profilePictureUrl: dbInstance?.profile_picture_url,
          lastConnection: dbInstance?.last_connection
        }
      })
      
      setInstances(combinedInstances)
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error)
      // Se não conseguir conectar com Evolution API, carrega só do banco
      try {
        const response = await fetch('/api/evolution/instances')
        if (response.ok) {
          const dbInstances = await response.json()
          const mappedInstances = dbInstances.map((db: any) => ({
            instanceName: db.instance_name,
            status: db.status || 'close',
            aiEnabled: db.ai_enabled,
            autoResponse: db.auto_response,
            welcomeMessage: db.welcome_message,
            webhookUrl: null,
            phone: db.phone,
            profilePictureUrl: db.profile_picture_url,
            lastConnection: db.last_connection
          }))
          setInstances(mappedInstances)
        }
      } catch (dbError) {
        console.error('Erro ao carregar do banco:', dbError)
        alert('Erro ao carregar instâncias. Verifique a conexão.')
      }
    } finally {
      setLoading(false)
    }
  }

  const createInstance = async () => {
    try {
      // Validações
      if (!newInstance.name.trim()) {
        alert('Nome da instância é obrigatório')
        return
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(newInstance.name)) {
        alert('Nome da instância deve conter apenas letras, números, hífen e underscore')
        return
      }

      if (instances.some(i => i.instanceName === newInstance.name)) {
        alert('Já existe uma instância com este nome')
        return
      }

      setLoading(true)
      
      // 1. Salvar configuração no banco primeiro
      const dbResponse = await fetch('/api/evolution/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: newInstance.name,
          aiEnabled: newInstance.aiEnabled,
          autoResponse: newInstance.autoResponse,
          welcomeMessage: newInstance.welcomeMessage
        })
      })

      if (!dbResponse.ok) {
        const error = await dbResponse.json()
        throw new Error(error.error || 'Erro ao salvar no banco')
      }

      // 2. Tentar criar instância na Evolution API
      try {
        await evolutionService.createInstance({
          instanceName: newInstance.name,
          token: newInstance.token || undefined,
          qrcode: true,
          webhook: `${window.location.origin}/api/rag/webhook`,
          webhookByEvents: false,
          webhookBase64: false,
          events: [
            'MESSAGES_UPSERT',
            'CONNECTION_UPDATE',
            'QRCODE_UPDATED'
          ]
        })

        // 3. Configurar webhook
        await evolutionService.setWebhook(newInstance.name, {
          url: `${window.location.origin}/api/rag/webhook`,
          enabled: true,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']
        })
      } catch (evolutionError) {
        console.warn('Erro na Evolution API, mas instância salva no banco:', evolutionError)
      }

      // 4. Fechar modal e resetar form
      setShowCreateModal(false)
      setNewInstance({
        name: '',
        token: '',
        aiEnabled: true,
        autoResponse: true,
        welcomeMessage: 'Olá! Como posso ajudá-lo hoje?'
      })
      
      // 5. Recarregar lista
      await loadInstances()
      
      alert('Instância criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar instância:', error)
      alert(`Erro ao criar instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const connectInstance = async (instanceName: string) => {
    try {
      setQrLoading(true)
      const response = await evolutionService.connectInstance(instanceName)
      
      if (response.qrcode) {
        setQrCode(response.qrcode)
        setSelectedInstance(instances.find(i => i.instanceName === instanceName) || null)
        setShowConfigModal(true)
      }
      
      await loadInstances()
    } catch (error) {
      console.error('Erro ao conectar instância:', error)
      alert('Erro ao gerar QR Code. Verifique se a Evolution API está funcionando.')
    } finally {
      setQrLoading(false)
    }
  }

  const refreshQrCode = async () => {
    if (!selectedInstance) return
    
    try {
      setQrLoading(true)
      const response = await evolutionService.connectInstance(selectedInstance.instanceName)
      
      if (response.qrcode) {
        setQrCode(response.qrcode)
      }
    } catch (error) {
      console.error('Erro ao atualizar QR Code:', error)
      alert('Erro ao atualizar QR Code')
    } finally {
      setQrLoading(false)
    }
  }

  const deleteInstance = async (instanceName: string) => {
    if (!confirm('Tem certeza que deseja excluir esta instância?')) return

    try {
      setLoading(true)
      
      // Excluir da Evolution API
      try {
        await evolutionService.deleteInstance(instanceName)
      } catch (evolutionError) {
        console.warn('Erro ao excluir da Evolution API:', evolutionError)
      }
      
      // Excluir do banco
      await fetch('/api/evolution/instances', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName })
      })
      
      await loadInstances()
      alert('Instância excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir instância:', error)
      alert('Erro ao excluir instância')
    } finally {
      setLoading(false)
    }
  }

  const updateInstanceConfig = async (instanceName: string, config: any) => {
    try {
      setConfigLoading(true)
      
      const response = await fetch('/api/evolution/instances', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName,
          ...config
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar configuração')
      }
      
      // Atualizar instância local
      setSelectedInstance(prev => prev ? { ...prev, ...config } : null)
      
      await loadInstances()
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      alert('Erro ao atualizar configuração')
    } finally {
      setConfigLoading(false)
    }
  }

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/rag/webhook`
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const formatLastConnection = (dateString?: string) => {
    if (!dateString) return 'Nunca conectado'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${diffDays} dias atrás`
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
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={loadInstances}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Instância
            </Button>
          </div>
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{instance.instanceName}</h3>
                            {instance.phone && (
                              <span className="text-sm text-gray-500">({instance.phone})</span>
                            )}
                          </div>
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
                            {instance.autoResponse && (
                              <Badge variant="secondary">Auto Resposta</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatLastConnection(instance.lastConnection)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {instance.status === 'close' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => connectInstance(instance.instanceName)}
                          disabled={qrLoading}
                        >
                          {qrLoading ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <QrCode className="w-4 h-4 mr-2" />
                              Conectar
                            </>
                          )}
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
          <Alert type="info">
            <Info className="w-4 h-4" />
            <div>
              <p className="text-sm">
                Crie uma nova instância para conectar um número do WhatsApp. 
                Cada instância pode ter configurações independentes de IA e automação.
              </p>
            </div>
          </Alert>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nome da Instância *
            </label>
            <Input
              value={newInstance.name}
              onChange={(e) => setNewInstance(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: atendimento, vendas, suporte"
              className={instances.some(i => i.instanceName === newInstance.name) ? 'border-red-500' : ''}
            />
            {instances.some(i => i.instanceName === newInstance.name) && (
              <p className="text-sm text-red-600 mt-1">Este nome já está em uso</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Apenas letras, números, hífen e underscore
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Token (Opcional)
            </label>
            <Input
              value={newInstance.token}
              onChange={(e) => setNewInstance(prev => ({ ...prev, token: e.target.value }))}
              placeholder="Token personalizado para esta instância"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe vazio para gerar automaticamente
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium">Ativar IA</label>
                <p className="text-xs text-gray-500">Respostas automáticas com inteligência artificial</p>
              </div>
              <Switch
                checked={newInstance.aiEnabled}
                onCheckedChange={(checked) => 
                  setNewInstance(prev => ({ ...prev, aiEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium">Resposta Automática</label>
                <p className="text-xs text-gray-500">Responder automaticamente às mensagens</p>
              </div>
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
            <Textarea
              value={newInstance.welcomeMessage}
              onChange={(e) => setNewInstance(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              placeholder="Mensagem enviada no primeiro contato com o cliente"
              rows={3}
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
              disabled={!newInstance.name || loading || instances.some(i => i.instanceName === newInstance.name)}
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
          <div className="space-y-6">
            {/* Status da instância */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Status da Instância</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={getStatusColor(selectedInstance.status)} className="mt-1">
                    {getStatusText(selectedInstance.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Conexão</p>
                  <p className="text-sm font-medium mt-1">
                    {formatLastConnection(selectedInstance.lastConnection)}
                  </p>
                </div>
                {selectedInstance.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="text-sm font-medium mt-1">{selectedInstance.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Webhook</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedInstance.webhookUrl ? (
                      <Badge variant="success">Configurado</Badge>
                    ) : (
                      <Badge variant="error">Não Configurado</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Escaneie o QR Code</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshQrCode}
                    disabled={qrLoading}
                  >
                    {qrLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="mx-auto max-w-xs border rounded"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Use o WhatsApp para escanear este código
                </p>
                <Alert type="warning" className="mt-3">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">
                    O QR Code expira em alguns minutos. Clique em atualizar se necessário.
                  </p>
                </Alert>
              </div>
            )}

            {/* Configurações da IA */}
            <div className="space-y-4">
              <h3 className="font-medium">Configurações da IA</h3>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium">Ativar IA</label>
                  <p className="text-xs text-gray-500">Respostas automáticas com inteligência artificial</p>
                </div>
                <Switch
                  checked={selectedInstance.aiEnabled}
                  onCheckedChange={(checked) => 
                    updateInstanceConfig(selectedInstance.instanceName, { aiEnabled: checked })
                  }
                  disabled={configLoading}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium">Resposta Automática</label>
                  <p className="text-xs text-gray-500">Responder automaticamente às mensagens</p>
                </div>
                <Switch
                  checked={selectedInstance.autoResponse}
                  onCheckedChange={(checked) => 
                    updateInstanceConfig(selectedInstance.instanceName, { autoResponse: checked })
                  }
                  disabled={configLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mensagem de Boas-vindas
                </label>
                <Textarea
                  value={selectedInstance.welcomeMessage || ''}
                  onChange={(e) => 
                    updateInstanceConfig(selectedInstance.instanceName, { welcomeMessage: e.target.value })
                  }
                  placeholder="Mensagem enviada no primeiro contato"
                  rows={3}
                  disabled={configLoading}
                />
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium">Configuração do Webhook</h3>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium mb-2">URL do Webhook</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${window.location.origin}/api/rag/webhook`}
                    readOnly
                    className="bg-gray-100"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyWebhookUrl}
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Esta URL é configurada automaticamente quando você cria uma instância
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <div>
                {selectedInstance.status === 'close' && (
                  <Button
                    variant="outline"
                    onClick={() => connectInstance(selectedInstance.instanceName)}
                    disabled={qrLoading}
                  >
                    {qrLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Gerar QR Code
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfigModal(false)
                  setQrCode('')
                  setSelectedInstance(null)
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
} 