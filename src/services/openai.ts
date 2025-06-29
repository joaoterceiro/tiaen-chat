import OpenAI from 'openai'
import { OpenAIConfig, RAGResponse, KnowledgeBase } from '@/types/rag'

class OpenAIService {
  private client: OpenAI | null = null
  private config: OpenAIConfig | null = null

  initialize(config: OpenAIConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true // Para uso no cliente - em produção usar API routes
    })
  }

  async generateResponse(
    userMessage: string,
    context: string = '',
    knowledgeBase: KnowledgeBase[] = []
  ): Promise<RAGResponse> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI service not initialized')
    }

    try {
      // Preparar contexto com base de conhecimento
      const contextPrompt = this.buildContextPrompt(knowledgeBase, context)

      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        messages: [
          {
            role: 'system',
            content: this.config.systemPrompt
          },
          {
            role: 'system',
            content: contextPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      })

      const answer = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.'

      return {
        answer,
        confidence: this.calculateConfidence(completion),
        sources: knowledgeBase,
        reasoning: 'Resposta gerada com base na base de conhecimento e contexto fornecido.',
        suggestedActions: this.extractSuggestedActions(answer)
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error)
      throw new Error('Falha ao gerar resposta do OpenAI')
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.client) {
      throw new Error('OpenAI service not initialized')
    }

    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Erro ao gerar embedding:', error)
      throw new Error('Falha ao gerar embedding')
    }
  }

  async analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'> {
    if (!this.client) {
      throw new Error('OpenAI service not initialized')
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.1,
        max_tokens: 10,
        messages: [
          {
            role: 'system',
            content: 'Analise o sentimento da mensagem e responda apenas com: positive, neutral, ou negative'
          },
          {
            role: 'user',
            content: text
          }
        ]
      })

      const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim()

      if (sentiment === 'positive' || sentiment === 'neutral' || sentiment === 'negative') {
        return sentiment
      }

      return 'neutral'
    } catch (error) {
      console.error('Erro ao analisar sentimento:', error)
      return 'neutral'
    }
  }

  async summarizeConversation(messages: string[]): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI service not initialized')
    }

    try {
      const conversation = messages.join('\n')

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.3,
        max_tokens: 200,
        messages: [
          {
            role: 'system',
            content: 'Resuma a conversa a seguir em português, destacando os pontos principais e a resolução (se houver):'
          },
          {
            role: 'user',
            content: conversation
          }
        ]
      })

      return completion.choices[0]?.message?.content || 'Não foi possível gerar resumo.'
    } catch (error) {
      console.error('Erro ao resumir conversa:', error)
      throw new Error('Falha ao resumir conversa')
    }
  }

  private buildContextPrompt(knowledgeBase: KnowledgeBase[], context: string): string {
    let prompt = 'Base de conhecimento disponível:\n'

    knowledgeBase.forEach((kb, index) => {
      prompt += `${index + 1}. ${kb.title}\n${kb.content}\n\n`
    })

    if (context) {
      prompt += `\nContexto adicional:\n${context}\n`
    }

    prompt += '\nUse essas informações para responder de forma precisa e útil. Se não souber a resposta, seja honesto sobre isso.'

    return prompt
  }

  private calculateConfidence(completion: any): number {
    // Lógica simples para calcular confiança baseada na resposta
    // Em um sistema real, isso seria mais sofisticado
    const hasChoice = completion.choices && completion.choices.length > 0
    const hasContent = completion.choices[0]?.message?.content

    if (!hasChoice || !hasContent) return 0

    const contentLength = completion.choices[0].message.content.length

    // Confiança baseada no tamanho da resposta e outros fatores
    if (contentLength > 100) return 0.9
    if (contentLength > 50) return 0.7
    if (contentLength > 20) return 0.5

    return 0.3
  }

  private extractSuggestedActions(answer: string): string[] {
    const actions: string[] = []

    // Lógica simples para extrair ações sugeridas
    if (answer.toLowerCase().includes('entre em contato')) {
      actions.push('Transferir para agente humano')
    }

    if (answer.toLowerCase().includes('documentos') || answer.toLowerCase().includes('arquivo')) {
      actions.push('Solicitar documentos')
    }

    if (answer.toLowerCase().includes('agendamento') || answer.toLowerCase().includes('agendar')) {
      actions.push('Agendar reunião')
    }

    return actions
  }

  // Método para buscar conhecimento relevante usando similaridade de embeddings
  async findRelevantKnowledge(
    query: string,
    knowledgeBase: KnowledgeBase[],
    threshold: number = 0.7
  ): Promise<KnowledgeBase[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query)

      const relevantKnowledge = knowledgeBase
        .filter(kb => kb.embedding && kb.isActive)
        .map(kb => ({
          ...kb,
          similarity: this.cosineSimilarity(queryEmbedding, kb.embedding!)
        }))
        .filter(kb => kb.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5) // Top 5 mais relevantes
        .map(({ similarity, ...kb }) => kb)

      return relevantKnowledge
    } catch (error) {
      console.error('Erro ao buscar conhecimento relevante:', error)
      return []
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

export const openAIService = new OpenAIService()
export default openAIService 