'use client'

import { useState, useEffect } from 'react'
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertDescription
} from '@/components/ui'
import ConfigurationAlert from '@/components/ui/ConfigurationAlert'
import { useRAG } from '@/contexts/RAGContext'
import { OpenAIConfig, EvolutionConfig } from '@/types/rag'
import { Key, Bot, Zap, CheckCircle, Settings } from 'lucide-react'

export default function ConfigurationPanel() {
  const { 
    configureOpenAI, 
    configureEvolution, 
    isConfigured, 
    error, 
    openAIConfig: existingOpenAIConfig,
    evolutionConfig: existingEvolutionConfig 
  } = useRAG()
  
  const [openAIConfig, setOpenAIConfig] = useState<OpenAIConfig>({
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: `Você é um assistente virtual inteligente para atendimento ao cliente via WhatsApp. 

Suas responsabilidades:
- Responder perguntas usando a base de conhecimento fornecida
- Ser educado, prestativo e profissional
- Manter conversas focadas no atendimento
- Transferir para agente humano quando necessário
- Sempre responder em português brasileiro

Diretrizes:
- Use informações da base de conhecimento quando disponível
- Se não souber a resposta, seja honesto e ofereça transferir para um agente
- Mantenha respostas concisas e claras
- Use emojis com moderação para humanizar a conversa`
  })

  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>({
    baseUrl: '',
    apiKey: '',
    instanceName: '',
    webhook: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [showConfiguration, setShowConfiguration] = useState(false)

  // Carregar configurações existentes se disponíveis
  useEffect(() => {
    if (existingOpenAIConfig) {
      setOpenAIConfig(existingOpenAIConfig)
    }
    if (existingEvolutionConfig) {
      setEvolutionConfig(existingEvolutionConfig)
    }
  }, [existingOpenAIConfig, existingEvolutionConfig])

  // Mostrar alerta de configuração se houver erro
  if (error) {
    return <ConfigurationAlert error={error} />
  }

  const handleOpenAISubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTestResult(null)

    try {
      await configureOpenAI(openAIConfig)
      setTestResult('✅ Configuração OpenAI salva com sucesso!')
    } catch (error) {
      setTestResult('❌ Erro ao configurar OpenAI: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEvolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTestResult(null)

    try {
      await configureEvolution(evolutionConfig)
      setTestResult('✅ Configuração Evolution API salva com sucesso!')
    } catch (error) {
      setTestResult('❌ Erro ao configurar Evolution API: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isConfigured && !showConfiguration) {
    return (
      <div className="space-y-6">
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ✅ Sistema configurado e pronto para uso! 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={() => setShowConfiguration(true)}
            >
              Alterar configurações
            </Button>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-green-600" />
                OpenAI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-secondary-600">
                  <strong>Modelo:</strong> {existingOpenAIConfig?.model || 'Não configurado'}
                </p>
                <p className="text-sm text-secondary-600">
                  <strong>Temperatura:</strong> {existingOpenAIConfig?.temperature || 'Não configurado'}
                </p>
                <p className="text-sm text-secondary-600">
                  <strong>Status:</strong> <span className="text-green-600">✅ Conectado</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Evolution API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-secondary-600">
                  <strong>Instância:</strong> {existingEvolutionConfig?.instanceName || 'Não configurado'}
                </p>
                <p className="text-sm text-secondary-600">
                  <strong>URL:</strong> {existingEvolutionConfig?.baseUrl ? '✅ Configurado' : 'Não configurado'}
                </p>
                <p className="text-sm text-secondary-600">
                  <strong>Status:</strong> <span className="text-green-600">✅ Conectado</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!isConfigured && (
        <Alert variant="info">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Configure suas credenciais OpenAI e Evolution API para começar a usar o sistema RAG.
          </AlertDescription>
        </Alert>
      )}

      {isConfigured && showConfiguration && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Alterar Configurações</h3>
          <Button 
            variant="outline" 
            onClick={() => setShowConfiguration(false)}
          >
            Voltar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OpenAIConfigCard 
          config={openAIConfig}
          setConfig={setOpenAIConfig}
          onSubmit={handleOpenAISubmit}
          isLoading={isLoading}
        />
        
        <EvolutionConfigCard 
          config={evolutionConfig}
          setConfig={setEvolutionConfig}
          onSubmit={handleEvolutionSubmit}
          isLoading={isLoading}
        />
      </div>

      {testResult && (
        <Alert variant={testResult.includes('✅') ? 'success' : 'error'}>
          <AlertDescription>{testResult}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

interface OpenAIConfigCardProps {
  config: OpenAIConfig
  setConfig: (config: OpenAIConfig) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

function OpenAIConfigCard({ config, setConfig, onSubmit, isLoading }: OpenAIConfigCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-green-600" />
          OpenAI Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              API Key
            </label>
            <Input
              type="password"
              placeholder="sk-..."
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Modelo
            </label>
            <Select 
              value={config.model} 
              onValueChange={(value) => setConfig({ ...config, model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Temperature
              </label>
              <Input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Max Tokens
              </label>
              <Input
                type="number"
                min="100"
                max="4000"
                value={config.maxTokens}
                onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              System Prompt
            </label>
            <Textarea
              rows={6}
              value={config.systemPrompt}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              placeholder="Instruções para o assistente..."
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Configurando...' : 'Salvar Configuração OpenAI'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface EvolutionConfigCardProps {
  config: EvolutionConfig
  setConfig: (config: EvolutionConfig) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

function EvolutionConfigCard({ config, setConfig, onSubmit, isLoading }: EvolutionConfigCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Evolution API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Base URL
            </label>
            <Input
              type="url"
              placeholder="https://sua-evolution-api.com"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              API Key
            </label>
            <Input
              type="password"
              placeholder="Sua chave da Evolution API"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Nome da Instância
            </label>
            <Input
              placeholder="minha-instancia"
              value={config.instanceName}
              onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Webhook URL (opcional)
            </label>
            <Input
              type="url"
              placeholder="https://seu-webhook.com/evolution"
              value={config.webhook}
              onChange={(e) => setConfig({ ...config, webhook: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Configurando...' : 'Salvar Configuração Evolution'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 