  }

  // Instâncias
  const createInstance = async (name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const instance = await evolutionService.createInstance(name)
      dispatch({ type: 'ADD_INSTANCE', payload: instance })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro desconhecido' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const connectInstance = async (instanceName: string) => {
    try {
      dispatch({ type: 'SET_CONNECTING', payload: true })
      const qrCode = await evolutionService.getQRCode(instanceName)
      // Atualizar instância com QR Code
      const instance = state.instances.find(i => i.name === instanceName)
      if (instance) {
        dispatch({ type: 'UPDATE_INSTANCE', payload: { ...instance, qrCode, status: 'connecting' } })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao conectar' })
    } finally {
      dispatch({ type: 'SET_CONNECTING', payload: false })
    }
  }

  const disconnectInstance = async (instanceName: string) => {
    try {
      await evolutionService.disconnectInstance(instanceName)
      const instance = state.instances.find(i => i.name === instanceName)
      if (instance) {
        dispatch({ type: 'UPDATE_INSTANCE', payload: { ...instance, status: 'disconnected', qrCode: undefined } })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao desconectar' })
    }
  }

  const refreshInstances = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const instances = await supabaseDataService.getEvolutionInstances()
      
      // Converter dados do Supabase para o formato esperado
      const convertedInstances: EvolutionInstance[] = instances.map(instance => ({
        id: instance.id,
        name: instance.name,
        status: instance.status as 'connected' | 'disconnected' | 'connecting',
        qrCode: instance.qr_code || undefined,
        phone: instance.phone || undefined,
        webhook: instance.webhook_url || undefined,
        apiKey: instance.api_key || undefined,
        baseUrl: instance.base_url || undefined
      }))
      
      dispatch({ type: 'SET_INSTANCES', payload: convertedInstances })
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar instâncias' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const refreshConversations = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const conversations = await supabaseDataService.getConversations()
      
      // Converter dados do Supabase para o formato esperado
      const convertedConversations: Conversation[] = conversations.map(conv => ({
        id: conv.id,
        contact: {
          id: conv.contact.id,
          name: conv.contact.name,
          phone: conv.contact.phone,
          email: conv.contact.email || undefined,
          profilePicture: conv.contact.profile_picture_url || undefined,
          isOnline: conv.contact.is_online,
          lastSeen: conv.contact.last_seen ? new Date(conv.contact.last_seen) : undefined,
          tags: conv.contact.tags || [],
          notes: conv.contact.notes || undefined
        },
        messages: conv.messages.map(msg => ({
          id: msg.id,
          body: msg.body,
          fromMe: msg.from_me,
          timestamp: new Date(msg.timestamp),
          status: msg.status as 'sent' | 'delivered' | 'read' | 'failed',
          type: msg.type as 'text' | 'image' | 'audio' | 'video' | 'document',
          metadata: msg.metadata as Record<string, any> || {}
        })),
        status: conv.status as 'active' | 'resolved' | 'pending',
        priority: conv.priority as 'low' | 'medium' | 'high',
        sentiment: conv.sentiment as 'positive' | 'neutral' | 'negative' | null,
        lastMessageAt: new Date(conv.updated_at),
        assignedAgent: conv.assigned_agent || undefined,
        tags: conv.tags || []
      }))
      
      dispatch({ type: 'SET_CONVERSATIONS', payload: convertedConversations })
      
      // Atualizar contatos também
      const contacts: Contact[] = conversations.map(conv => conv.contact)
      dispatch({ type: 'SET_CONTACTS', payload: contacts })
      
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar conversas' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Mensagens
  const sendMessage = async (phone: string, message: string) => {
    if (!state.activeInstance) {
      dispatch({ type: 'SET_ERROR', payload: 'Nenhuma instância ativa' })
      return
    }

    try {
      dispatch({ type: 'SET_SENDING', payload: true })
      
      // Inicializar Evolution API se não estiver inicializada
      if (state.evolutionConfig) {
        evolutionService.initialize(state.evolutionConfig)
      }
      
      const sentMessage = await evolutionService.sendTextMessage(state.activeInstance.name, phone, message)
      
      // Salvar mensagem no banco de dados
      const conversation = state.conversations.find(c => c.contact.phone === phone)
      if (conversation) {
        const savedMessage = await supabaseDataService.createMessage({
          conversation_id: conversation.id,
          from_phone: null, // Bot não tem phone
          to_phone: phone,
          body: message,
          message_type: 'text',
          is_from_bot: true,
          status: 'sent',
          metadata: {},
          timestamp: sentMessage.timestamp
        })
        
        // Adicionar mensagem ao estado local
        dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: conversation.id, message: sentMessage } })
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao enviar mensagem' })
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false })
    }
  }

  const sendRAGResponse = async (phone: string, userMessage: string) => {
    if (!state.activeInstance) {
      dispatch({ type: 'SET_ERROR', payload: 'Nenhuma instância ativa' })
      return
    }

    try {
      dispatch({ type: 'SET_SENDING', payload: true })
      
      // Buscar conhecimento relevante
      const relevantKnowledge = await openAIService.findRelevantKnowledge(userMessage, state.knowledgeBase)
      
      // Gerar resposta RAG
      const ragResponse = await openAIService.generateResponse(userMessage, '', relevantKnowledge)
      
      // Enviar resposta
      await sendMessage(phone, ragResponse.answer)
      
    } catch (error) {
      console.error('Erro ao gerar resposta RAG:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao gerar resposta RAG' })
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false })
    }
  }

  // Carregar mensagens do WhatsApp via Evolution API
  const loadWhatsAppMessages = async (phone: string, limit: number = 50) => {
    if (!state.activeInstance || !state.evolutionConfig) {
      return
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Inicializar Evolution API
      evolutionService.initialize(state.evolutionConfig)
      
      // Buscar mensagens do WhatsApp
      const whatsappMessages = await evolutionService.fetchMessages(state.activeInstance.name, phone, limit)
      
      // Encontrar ou criar conversa
      let conversation = state.conversations.find(c => c.contact.phone === phone)
      
      if (!conversation) {
        // Criar contato se não existir
        let contact = await supabaseDataService.getContactByPhone(phone)
        if (!contact) {
          contact = await supabaseDataService.createContact({
            phone,
            name: `Contato ${phone.slice(-4)}`,
            is_online: true,
            tags: ['whatsapp'],
            notes: 'Contato criado automaticamente'
          })
        }
        
        // Criar conversa
        const newConversation = await supabaseDataService.createConversation({
          contact_id: contact.id,
          status: 'active',
          priority: 'medium',
          tags: ['whatsapp'],
          summary: 'Conversa carregada do WhatsApp',
          sentiment: 'neutral'
        })
        
        conversation = {
          id: newConversation.id,
          contact,
          messages: [],
          status: newConversation.status as 'active',
          priority: newConversation.priority as 'medium',
          sentiment: newConversation.sentiment as 'neutral',
          lastMessageAt: new Date(newConversation.updated_at),
          tags: newConversation.tags || []
        }
        
        dispatch({ type: 'ADD_CONVERSATION', payload: conversation })
      }
      
      // Salvar mensagens no banco (apenas as que não existem)
      for (const msg of whatsappMessages) {
        try {
          await supabaseDataService.createMessage({
            conversation_id: conversation.id,
            from_phone: msg.isFromBot ? null : phone,
            to_phone: msg.isFromBot ? phone : null,
            body: msg.body,
            message_type: msg.type,
            is_from_bot: msg.isFromBot,
            status: msg.status,
            metadata: msg.metadata || {},
            timestamp: msg.timestamp
          })
          
          // Adicionar ao estado local
          dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: conversation.id, message: msg } })
        } catch (error) {
          // Ignorar erro se mensagem já existe (constraint violation)
          if (error instanceof Error && !error.message.includes('duplicate')) {
            console.error('Erro ao salvar mensagem:', error)
          }
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar mensagens do WhatsApp:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar mensagens do WhatsApp' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Conversas
  const selectConversation = (conversation: Conversation) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation })
    
    // Carregar mensagens do WhatsApp se necessário
    if (conversation.contact.phone && state.activeInstance) {
      loadWhatsAppMessages(conversation.contact.phone)
    }
  }

  // Base de Conhecimento
  const addKnowledge = async (knowledge: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const created = await supabaseDataService.createKnowledge({
        title: knowledge.title,
        content: knowledge.content,
        category: knowledge.category,
        tags: knowledge.tags || [],
        is_active: true,
        metadata: knowledge.metadata || {},
        embedding: null // Será gerado pelo OpenAI posteriormente
      })
      
      const convertedKnowledge: KnowledgeBase = {
        id: created.id,
        title: created.title,
        content: created.content,
        category: created.category,
        tags: created.tags || [],
        metadata: created.metadata || {},
        isActive: created.is_active,
        createdAt: new Date(created.created_at),
        updatedAt: new Date(created.updated_at)
      }
      
      dispatch({ type: 'ADD_KNOWLEDGE', payload: convertedKnowledge })
      
    } catch (error) {
      console.error('Erro ao adicionar conhecimento:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar conhecimento' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateKnowledge = async (id: string, updates: Partial<KnowledgeBase>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const updated = await supabaseDataService.updateKnowledge(id, {
        title: updates.title,
        content: updates.content,
        category: updates.category,
        tags: updates.tags,
        is_active: updates.isActive,
        metadata: updates.metadata
      })
      
      const convertedKnowledge: KnowledgeBase = {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        category: updated.category,
        tags: updated.tags || [],
        metadata: updated.metadata || {},
        isActive: updated.is_active,
        createdAt: new Date(updated.created_at),
        updatedAt: new Date(updated.updated_at)
      }
      
      dispatch({ type: 'UPDATE_KNOWLEDGE', payload: convertedKnowledge })
      
    } catch (error) {
      console.error('Erro ao atualizar conhecimento:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar conhecimento' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deleteKnowledge = async (id: string) => {
    try {
      await supabaseDataService.deleteKnowledge(id)
      dispatch({ type: 'DELETE_KNOWLEDGE', payload: id })
    } catch (error) {
      console.error('Erro ao excluir conhecimento:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao excluir conhecimento' })
    }
  }

  // Automação
  const addAutomationRule = (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    dispatch({ type: 'ADD_AUTOMATION_RULE', payload: newRule })
  }

  const updateAutomationRule = (id: string, updates: Partial<AutomationRule>) => {
    const rule = state.automationRules.find(r => r.id === id)
    if (!rule) return

    const updatedRule: AutomationRule = {
      ...rule,
      ...updates,
      updatedAt: new Date()
    }
    dispatch({ type: 'UPDATE_AUTOMATION_RULE', payload: updatedRule })
  }

  const deleteAutomationRule = (id: string) => {
    dispatch({ type: 'DELETE_AUTOMATION_RULE', payload: id })
  }

  // Utilitários
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }

  // Carregar dados iniciais
  const checkConfiguration = useCallback(() => {
    const hasOpenAI = state.openAIConfig?.apiKey
    const hasEvolution = state.evolutionConfig?.baseUrl && state.evolutionConfig?.apiKey
    const isConfigured = Boolean(hasOpenAI && hasEvolution)
    dispatch({ type: 'SET_CONFIGURED', payload: isConfigured })
  }, [state.openAIConfig, state.evolutionConfig])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Verificar se as variáveis de ambiente estão configuradas
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          dispatch({ 
            type: 'SET_ERROR', 
            payload: '⚠️ Configuração do Supabase não encontrada! Verifique o arquivo .env.local com as credenciais do Supabase. Consulte CONFIGURACAO.md para instruções.' 
          })
          return
        }
        
        // Primeiro, verificar se o sistema já foi configurado
        const systemConfigured = await supabaseDataService.getSystemSetting('system_configured')
        
        if (systemConfigured && systemConfigured.value === 'true') {
          // Sistema já configurado, carregar configurações do Supabase
          await loadConfigurationsFromSupabase()
        } else {
          // Sistema não configurado, tentar carregar do localStorage
          const savedOpenAIConfig = localStorage.getItem('openai-config')
          const savedEvolutionConfig = localStorage.getItem('evolution-config')
          
          if (savedOpenAIConfig) {
            const config = JSON.parse(savedOpenAIConfig)
            dispatch({ type: 'SET_OPENAI_CONFIG', payload: config })
            openAIService.initialize(config)
          }
          
          if (savedEvolutionConfig) {
            const config = JSON.parse(savedEvolutionConfig)
            dispatch({ type: 'SET_EVOLUTION_CONFIG', payload: config })
            evolutionService.initialize(config)
          }
        }
        
        checkConfiguration()
        
        // Carregar dados do Supabase
        await Promise.all([
          refreshInstances(),
          refreshConversations(),
          loadKnowledgeBase(),
          loadAutomationRules()
        ])
        
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error)
        let errorMessage = 'Erro ao carregar dados iniciais'
        
        if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            errorMessage = '🔌 Erro de conexão com Supabase. Verifique suas credenciais no arquivo .env.local'
          } else if (error.message.includes('Invalid API key')) {
            errorMessage = '🔑 Chave API do Supabase inválida. Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local'
          } else if (error.message.includes('Project not found')) {
            errorMessage = '📂 Projeto Supabase não encontrado. Verifique NEXT_PUBLIC_SUPABASE_URL no .env.local'
          } else {
            errorMessage = `❌ ${error.message}`
          }
        }
        
        dispatch({ type: 'SET_ERROR', payload: errorMessage })
      }
    }

    loadInitialData()
  }, [])

  const loadConfigurationsFromSupabase = async () => {
    try {
      // Buscar configurações de IA do Supabase
      const aiConfigs = await supabaseDataService.getAIConfigurations()
      
      // Buscar configuração OpenAI
      const openAIConfig = aiConfigs.find(config => config.provider === 'openai')
      if (openAIConfig) {
        const config: OpenAIConfig = {
          apiKey: openAIConfig.api_key_encrypted,
          model: openAIConfig.model,
          temperature: openAIConfig.temperature || 0.7,
          maxTokens: openAIConfig.max_tokens || 1000,
          systemPrompt: openAIConfig.system_prompt || 'Você é um assistente virtual inteligente para atendimento ao cliente via WhatsApp.'
        }
        dispatch({ type: 'SET_OPENAI_CONFIG', payload: config })
        openAIService.initialize(config)
      }
      
      // Buscar configuração Evolution API das system_settings
      const [evolutionUrl, evolutionKey, evolutionInstance, evolutionWebhook] = await Promise.all([
        supabaseDataService.getSystemSetting('evolution_api_url'),
        supabaseDataService.getSystemSetting('evolution_api_key'),
        supabaseDataService.getSystemSetting('evolution_instance_name'),
        supabaseDataService.getSystemSetting('evolution_webhook_url')
      ])
      
      if (evolutionUrl && evolutionKey && evolutionInstance) {
        const config: EvolutionConfig = {
          baseUrl: JSON.parse(evolutionUrl.value),
          apiKey: JSON.parse(evolutionKey.value),
          instanceName: JSON.parse(evolutionInstance.value),
          webhook: evolutionWebhook ? JSON.parse(evolutionWebhook.value) : undefined
        }
        dispatch({ type: 'SET_EVOLUTION_CONFIG', payload: config })
        evolutionService.initialize(config)
      }
      
    } catch (error) {
      console.error('Erro ao carregar configurações do Supabase:', error)
      // Não disparar erro aqui, pois pode ser que as configurações ainda não existam
    }
  }

  const loadKnowledgeBase = async () => {
    try {
      const knowledge = await supabaseDataService.getKnowledgeBase()
      
      const convertedKnowledge: KnowledgeBase[] = knowledge.map(kb => ({
        id: kb.id,
        title: kb.title,
        content: kb.content,
        category: kb.category,
        tags: kb.tags || [],
        metadata: kb.metadata || {},
        isActive: kb.is_active,
        createdAt: new Date(kb.created_at),
        updatedAt: new Date(kb.updated_at)
      }))
      
      dispatch({ type: 'SET_KNOWLEDGE_BASE', payload: convertedKnowledge })
    } catch (error) {
      console.error('Erro ao carregar base de conhecimento:', error)
    }
  }

  const loadAutomationRules = async () => {
    try {
      const rules = await supabaseDataService.getAutomationRules()
      
      const convertedRules: AutomationRule[] = rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description || '',
        triggerType: rule.trigger_type as 'keyword' | 'time' | 'sentiment' | 'first_message',
        triggerValue: rule.trigger_value,
        actionType: rule.action_type as 'send_message' | 'transfer_agent' | 'add_tag' | 'create_ticket',
        actionValue: rule.action_value,
        isActive: rule.is_active,
        createdAt: new Date(rule.created_at),
        updatedAt: new Date(rule.updated_at)
      }))
      
      dispatch({ type: 'SET_AUTOMATION_RULES', payload: convertedRules })
    } catch (error) {
      console.error('Erro ao carregar regras de automação:', error)
    }
  }

  const value: RAGContextType = {
    ...state,
    configureOpenAI,
    configureEvolution,
    createInstance,
    connectInstance,
    disconnectInstance,
    refreshInstances,
    sendMessage,
    sendRAGResponse,
    loadWhatsAppMessages,
    selectConversation,
    refreshConversations,
    addKnowledge,
    updateKnowledge,
    deleteKnowledge,
    addAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    clearError
  }

  return <RAGContext.Provider value={value}>{children}</RAGContext.Provider>
}

export function useRAG() {
  const context = useContext(RAGContext)
  if (context === undefined) {
    throw new Error('useRAG must be used within a RAGProvider')
  }
  return context
