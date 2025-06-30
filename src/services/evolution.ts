import axios, { AxiosInstance } from 'axios'
import { EvolutionConfig, EvolutionInstance, WhatsAppMessage } from '@/types/rag'
import { Supabase } from '@supabase/supabase-js'

class EvolutionService {
  private client: AxiosInstance | null = null
  private config: EvolutionConfig | null = null
  private supabase: Supabase

  constructor(client: AxiosInstance | null, supabase: Supabase) {
    this.client = client
    this.supabase = supabase
  }

  initialize(config: EvolutionConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey
      }
    })
  }

  private checkInitialization() {
    if (!this.client) {
      throw new Error('Serviço Evolution não foi inicializado corretamente')
    }
  }

  private handleError(error: any, customMessage: string): never {
    console.error(`${customMessage}:`, error)

    if (error.response?.data?.error) {
      throw new Error(`${customMessage}: ${error.response.data.error}`)
    }

    if (error.message) {
      throw new Error(`${customMessage}: ${error.message}`)
    }

    throw new Error(customMessage)
  }

  // Gerenciamento de Instâncias
  async createInstance(config: {
    instanceName: string
    token?: string
    qrcode?: boolean
    webhook?: string
    webhookByEvents?: boolean
    webhookBase64?: boolean
    events?: string[]
  }): Promise<EvolutionInstance> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.post('/instance/create', {
        instanceName: config.instanceName,
        token: config.token || this.config?.apiKey,
        qrcode: config.qrcode ?? true,
        webhook: config.webhook || this.config?.webhook,
        webhookByEvents: config.webhookByEvents ?? false,
        webhookBase64: config.webhookBase64 ?? false,
        events: config.events || ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']
      })

      return {
        id: response.data.instance.instanceName,
        name: response.data.instance.instanceName,
        status: 'disconnected',
        webhook: config.webhook || this.config?.webhook,
        createdAt: new Date(),
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error)
      throw new Error('Falha ao criar instância Evolution')
    }
  }

  async connectInstance(instanceName: string): Promise<{ qrcode?: string }> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.get(`/instance/connect/${instanceName}`)

      // Log para debug
      console.log('Evolution API connect response:', response.data)

      // Tenta diferentes formatos possíveis da resposta
      const qrcode = response.data.qrcode?.code || // Formato 1
        response.data.qrcode || // Formato 2
        response.data.code || // Formato 3
        response.data.data?.qrcode || // Formato 4
        response.data.data?.code // Formato 5

      if (!qrcode) {
        console.warn('QR Code não encontrado na resposta:', response.data)
      }

      return { qrcode }
    } catch (error) {
      console.error('Erro ao conectar instância:', error)
      throw new Error('Falha ao conectar instância')
    }
  }

  async getInstanceInfo(instanceName: string): Promise<EvolutionInstance> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.get(`/instance/connectionState/${instanceName}`)

      return {
        id: instanceName,
        name: instanceName,
        status: this.mapConnectionStatus(response.data.instance.state),
        phone: response.data.instance.phone,
        profilePicture: response.data.instance.profilePictureUrl,
        webhook: this.config?.webhook,
        createdAt: new Date(),
        lastConnection: response.data.instance.state === 'open' ? new Date() : undefined
      }
    } catch (error) {
      console.error('Erro ao obter info da instância:', error)
      throw new Error('Falha ao obter informações da instância')
    }
  }

  async getQRCode(instanceName: string): Promise<string> {
    this.checkInitialization()

    try {
      const response = await this.client.get(`/instance/connect/${instanceName}`)
      return response.data.qrcode?.code || ''
    } catch (error) {
      this.handleError(error, 'Falha ao obter QR Code')
    }
  }

  async disconnectInstance(instanceName: string): Promise<void> {
    this.checkInitialization()

    try {
      await this.client.delete(`/instance/logout/${instanceName}`)
    } catch (error) {
      this.handleError(error, 'Falha ao desconectar instância')
    }
  }

  async deleteInstance(instanceName: string): Promise<void> {
    this.checkInitialization()

    try {
      await this.client.delete(`/instance/delete/${instanceName}`)
    } catch (error) {
      this.handleError(error, 'Falha ao deletar instância')
    }
  }

  async getInstances(): Promise<EvolutionInstance[]> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.get('/instance/fetchInstances')

      return response.data.map((instance: any) => ({
        id: instance.instanceName,
        name: instance.instanceName,
        status: this.mapConnectionStatus(instance.connectionStatus),
        phone: instance.phone,
        profilePicture: instance.profilePictureUrl,
        webhook: this.config?.webhook,
        createdAt: new Date(instance.createdAt || Date.now()),
        lastConnection: instance.connectionStatus === 'open' ? new Date() : undefined
      }))
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error)
      throw new Error('Falha ao buscar instâncias')
    }
  }

  // Envio de Mensagens
  async sendTextMessage(instanceName: string, phone: string, message: string): Promise<WhatsAppMessage> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const timestamp = new Date()
      const response = await this.client.post(`/message/sendText/${instanceName}`, {
        number: phone,
        text: message,
        options: {
          delay: 1200,
          presence: 'composing'
        }
      })

      // Criar mensagem no banco de dados
      const { data: savedMessage, error } = await this.supabase
        .from('chat_messages')
        .insert({
          instance_id: instanceName,
          phone_number: phone,
          message: message,
          is_bot: true,
          metadata: {
            messageId: response.data.key.id,
            fromMe: true,
            status: 'sent'
          },
          created_at: timestamp.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return savedMessage
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw new Error('Falha ao enviar mensagem')
    }
  }

  async sendMediaMessage(
    instanceName: string,
    phone: string,
    mediaUrl: string,
    caption?: string,
    fileName?: string
  ): Promise<WhatsAppMessage> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.post(`/message/sendMedia/${instanceName}`, {
        number: phone,
        mediatype: 'image', // ou 'video', 'audio', 'document'
        media: mediaUrl,
        caption,
        fileName
      })

      return {
        id: response.data.key.id,
        from: 'bot',
        to: phone,
        body: caption || '',
        timestamp: new Date(),
        type: 'image',
        status: 'sent',
        isFromBot: true,
        metadata: {
          fileName,
          caption
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mídia:', error)
      throw new Error('Falha ao enviar mídia')
    }
  }

  // Busca de Mensagens
  async fetchMessages(instanceName: string, phone: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.get(`/chat/fetchMessages/${instanceName}`, {
        params: {
          number: phone,
          limit
        }
      })

      return response.data.messages.map((msg: any) => this.mapMessage(msg))
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      throw new Error('Falha ao buscar mensagens')
    }
  }

  // Gerenciamento de Contatos
  async getContacts(instanceName: string): Promise<any[]> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.get(`/chat/findContacts/${instanceName}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
      throw new Error('Falha ao buscar contatos')
    }
  }

  async getContactInfo(instanceName: string, phone: string): Promise<any> {
    this.checkInitialization()

    try {
      const response = await this.client.get(`/chat/whatsappNumbers/${instanceName}`, {
        params: { numbers: [phone] }
      })

      if (!response.data?.[0]) {
        throw new Error('Contato não encontrado')
      }

      return response.data[0]
    } catch (error) {
      this.handleError(error, 'Falha ao buscar informações do contato')
    }
  }

  // Webhook Management
  async setWebhook(instanceName: string, config: {
    url: string
    enabled?: boolean
    events?: string[]
  }): Promise<void> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      await this.client.post(`/webhook/set/${instanceName}`, {
        url: config.url,
        enabled: config.enabled ?? true,
        events: config.events || [
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
    } catch (error) {
      console.error('Erro ao configurar webhook:', error)
      throw new Error('Falha ao configurar webhook')
    }
  }

  // Métodos auxiliares
  private mapConnectionStatus(state: string): EvolutionInstance['status'] {
    switch (state) {
      case 'open':
        return 'connected'
      case 'connecting':
        return 'connecting'
      case 'close':
        return 'disconnected'
      default:
        return 'error'
    }
  }

  private mapMessage(msg: any): WhatsAppMessage {
    return {
      id: msg.key.id,
      from: msg.key.fromMe ? 'bot' : msg.key.remoteJid,
      to: msg.key.fromMe ? msg.key.remoteJid : 'bot',
      body: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
      timestamp: new Date(msg.messageTimestamp * 1000),
      type: this.getMessageType(msg.message),
      status: msg.status || 'delivered',
      isFromBot: msg.key.fromMe,
      metadata: this.extractMetadata(msg.message)
    }
  }

  private getMessageType(message: any): WhatsAppMessage['type'] {
    if (message.conversation || message.extendedTextMessage) return 'text'
    if (message.imageMessage) return 'image'
    if (message.videoMessage) return 'video'
    if (message.audioMessage) return 'audio'
    if (message.documentMessage) return 'document'
    return 'text'
  }

  private extractMetadata(message: any): WhatsAppMessage['metadata'] {
    const metadata: WhatsAppMessage['metadata'] = {}

    if (message.imageMessage) {
      metadata.caption = message.imageMessage.caption
      metadata.mimeType = message.imageMessage.mimetype
    }

    if (message.videoMessage) {
      metadata.caption = message.videoMessage.caption
      metadata.mimeType = message.videoMessage.mimetype
    }

    if (message.audioMessage) {
      metadata.mimeType = message.audioMessage.mimetype
    }

    if (message.documentMessage) {
      metadata.fileName = message.documentMessage.fileName
      metadata.mimeType = message.documentMessage.mimetype
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined
  }

  // Método para processar webhooks recebidos
  processWebhook(data: any): WhatsAppMessage | null {
    try {
      if (data.event === 'MESSAGES_UPSERT' && data.data?.messages) {
        const message = data.data.messages[0]
        return this.mapMessage(message)
      }
      return null
    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      return null
    }
  }

  async getMessages(instanceName: string, chatId: string): Promise<any[]> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.get(`/message/fetch/${instanceName}`, {
        params: {
          chatId,
          limit: 50, // Limite de mensagens para buscar
          order: 'desc' // Mais recentes primeiro
        }
      })

      // Log para debug
      console.log('Evolution API messages response:', response.data)

      // Retorna array de mensagens ou array vazio se não encontrar
      return response.data.messages || response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      throw new Error('Falha ao buscar mensagens')
    }
  }

  isInitialized(): boolean {
    return !!this.client && !!this.config;
  }
}

// Criar e exportar uma instância do serviço
export const evolutionService = new EvolutionService(null, null)

// Exportar a classe também para casos específicos
export { EvolutionService } 