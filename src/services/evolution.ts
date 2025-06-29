import axios, { AxiosInstance } from 'axios'
import { EvolutionConfig, EvolutionInstance, WhatsAppMessage } from '@/types/rag'

class EvolutionService {
  private client: AxiosInstance | null = null
  private config: EvolutionConfig | null = null

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

  // Gerenciamento de Instâncias
  async createInstance(instanceName: string): Promise<EvolutionInstance> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.post('/instance/create', {
        instanceName,
        token: this.config?.apiKey,
        qrcode: true,
        webhook: this.config?.webhook
      })

      return {
        id: response.data.instance.instanceName,
        name: response.data.instance.instanceName,
        status: 'disconnected',
        webhook: this.config?.webhook,
        createdAt: new Date(),
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error)
      throw new Error('Falha ao criar instância Evolution')
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
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.get(`/instance/connect/${instanceName}`)
      return response.data.qrcode?.code || ''
    } catch (error) {
      console.error('Erro ao obter QR Code:', error)
      throw new Error('Falha ao obter QR Code')
    }
  }

  async disconnectInstance(instanceName: string): Promise<void> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      await this.client.delete(`/instance/logout/${instanceName}`)
    } catch (error) {
      console.error('Erro ao desconectar instância:', error)
      throw new Error('Falha ao desconectar instância')
    }
  }

  async deleteInstance(instanceName: string): Promise<void> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      await this.client.delete(`/instance/delete/${instanceName}`)
    } catch (error) {
      console.error('Erro ao deletar instância:', error)
      throw new Error('Falha ao deletar instância')
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
      const response = await this.client.post(`/message/sendText/${instanceName}`, {
        number: phone,
        text: message
      })

      return {
        id: response.data.key.id,
        from: response.data.key.fromMe ? 'bot' : phone,
        to: response.data.key.fromMe ? phone : 'bot',
        body: message,
        timestamp: new Date(),
        type: 'text',
        status: 'sent',
        isFromBot: true
      }
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
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      const response = await this.client.get(`/chat/whatsappNumbers/${instanceName}`, {
        params: { numbers: [phone] }
      })
      return response.data[0]
    } catch (error) {
      console.error('Erro ao buscar info do contato:', error)
      throw new Error('Falha ao buscar informações do contato')
    }
  }

  // Webhook Management
  async setWebhook(instanceName: string, webhookUrl: string): Promise<void> {
    if (!this.client) {
      throw new Error('Evolution service not initialized')
    }

    try {
      await this.client.post(`/webhook/set/${instanceName}`, {
        url: webhookUrl,
        enabled: true,
        events: [
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
}

export const evolutionService = new EvolutionService()
export default evolutionService 