'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Alert,
  AlertDescription
} from '@/components/ui'
import { RAGProvider, useRAG } from '@/contexts/RAGContext'
import { MessageSquare, Bot, Settings, BarChart3, Users, Brain, Zap, Phone, ArrowLeft } from 'lucide-react'

// Componentes internos
import ConversationsPanel from '@/components/rag/ConversationsPanel'
import ChatInterface from '@/components/rag/ChatInterface'
import ConfigurationPanel from '@/components/rag/ConfigurationPanel'
import KnowledgeBasePanel from '@/components/rag/KnowledgeBasePanel'
import AnalyticsPanel from '@/components/rag/AnalyticsPanel'
import InstancesPanel from '@/components/rag/InstancesPanel'
import AutomationPanel from '@/components/rag/AutomationPanel'

function RAGDashboard() {
  const { 
    isConfigured, 
    activeInstance, 
    conversations, 
    activeConversation,
    analytics,
    error,
    clearError
  } = useRAG()

  const [activeTab, setActiveTab] = useState('conversations')

  if (!isConfigured) {
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
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900">Sistema RAG</h1>
              </div>
              <Badge variant="warning">Configuração Necessária</Badge>
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
                  Agente RAG WhatsApp 🤖
                </h1>
                <p className="text-secondary-600">
                  Configure suas credenciais OpenAI e Evolution API para começar
                </p>
              </div>
            </div>
          </div>
          
          <Card variant="elevated" className="max-w-2xl mx-auto hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Configuração Inicial</CardTitle>
                  <p className="text-sm text-secondary-600">Configure as APIs necessárias</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ConfigurationPanel />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900">
                  Agente RAG WhatsApp
                </h1>
              </div>
              
              {activeInstance && (
                <Badge 
                  variant={activeInstance.status === 'connected' ? 'success' : 'warning'}
                  className="flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  {activeInstance.name} - {activeInstance.status}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {conversations.length} conversas
              </Badge>
              
              <Badge variant="primary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {conversations.filter(c => c.status === 'active').length} ativas
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Alert variant="error">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError}>
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-secondary-200 bg-white/50 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 p-2 m-2 bg-white/80">
              <TabsTrigger value="conversations" className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center gap-1 text-xs">
                <Brain className="h-3 w-3" />
                Base
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-1 text-xs">
                <Zap className="h-3 w-3" />
                Auto
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
                <BarChart3 className="h-3 w-3" />
                Stats
              </TabsTrigger>
            </TabsList>

            <div className="h-[calc(100%-60px)] overflow-hidden">
              <TabsContent value="conversations" className="h-full m-0">
                <ConversationsPanel />
              </TabsContent>
              
              <TabsContent value="knowledge" className="h-full m-0">
                <KnowledgeBasePanel />
              </TabsContent>
              
              <TabsContent value="automation" className="h-full m-0">
                <AutomationPanel />
              </TabsContent>
              
              <TabsContent value="analytics" className="h-full m-0">
                <AnalyticsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <ChatInterface />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/30 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  Selecione uma conversa
                </h3>
                <p className="text-secondary-600 max-w-md mx-auto">
                  Escolha uma conversa da lista para começar o atendimento com IA
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Instance Management */}
        <div className="w-80 border-l border-secondary-200 bg-white/50 backdrop-blur-sm">
          <div className="p-4 border-b border-secondary-200 bg-white/80">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center">
                <Phone className="h-3 w-3" />
              </div>
              <h3 className="font-semibold text-secondary-900">Instâncias WhatsApp</h3>
            </div>
            <p className="text-sm text-secondary-600">
              Gerencie suas conexões Evolution API
            </p>
          </div>
          <InstancesPanel />
        </div>
      </div>
    </div>
  )
}

export default function RAGPage() {
  return (
    <RAGProvider>
      <RAGDashboard />
    </RAGProvider>
  )
} 