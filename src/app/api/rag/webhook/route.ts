import { NextRequest, NextResponse } from 'next/server'
import { evolutionService } from '@/services/evolution'
import { supabaseDataService } from '@/services/supabase-data'
import { openAIService } from '@/services/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Webhook recebido:', JSON.stringify(body, null, 2))

    // Processar webhook do Evolution API
    const message = evolutionService.processWebhook(body)

    if (message) {
      console.log('Nova mensagem processada:', message)

      try {
        // 1. Buscar ou criar contato
        let contact = await supabaseDataService.getContactByPhone(message.from === 'bot' ? message.to : message.from)

        if (!contact) {
          // Criar novo contato se não existir
          const phoneNumber = message.from === 'bot' ? message.to : message.from
          const contactName = body.data?.pushName || body.data?.notifyName || `Contato ${phoneNumber.slice(-4)}`

          contact = await supabaseDataService.createContact({
            phone: phoneNumber,
            name: contactName,
            profile_picture_url: body.data?.profilePicUrl || null,
            is_online: true,
            tags: ['whatsapp'],
            notes: 'Contato criado automaticamente via webhook'
          })
        } else {
          // Atualizar status online do contato
          await supabaseDataService.updateContact(contact.id, {
            is_online: true,
            last_seen: new Date()
          })
        }

        // 2. Buscar ou criar conversa
        let conversation = await supabaseDataService.getConversationByContactId(contact.id)

        if (!conversation) {
          conversation = await supabaseDataService.createConversation({
            contact_id: contact.id,
            status: 'active',
            priority: 'medium',
            tags: ['whatsapp', 'webhook'],
            summary: 'Conversa iniciada via WhatsApp',
            sentiment: 'neutral'
          })
        }

        // 3. Salvar mensagem no banco
        const savedMessage = await supabaseDataService.createMessage({
          conversation_id: conversation.id,
          from_phone: message.from === 'bot' ? null : message.from,
          to_phone: message.to === 'bot' ? null : message.to,
          body: message.body,
          message_type: message.type,
          is_from_bot: message.isFromBot || false,
          status: message.status,
          metadata: message.metadata || {},
          timestamp: message.timestamp
        })

        // 4. Se a mensagem não é do bot, processar resposta automática
        if (!message.isFromBot && message.from !== 'bot') {
          // Verificar se há regras de automação ativas
          const automationRules = await supabaseDataService.getActiveAutomationRules()

          for (const rule of automationRules) {
            if (shouldTriggerRule(rule, message, conversation)) {
              await executeAutomationRule(rule, message, conversation)
            }
          }

          // Se não há resposta automática, verificar se deve gerar resposta RAG
          const shouldGenerateRAG = await shouldGenerateRAGResponse(conversation, message)

          if (shouldGenerateRAG) {
            try {
              // Buscar base de conhecimento relevante
              const knowledgeBase = await supabaseDataService.getKnowledgeBase()
              const relevantKnowledge = await openAIService.findRelevantKnowledge(message.body, knowledgeBase)

              // Gerar resposta RAG
              const ragResponse = await openAIService.generateResponse(
                message.body,
                conversation.summary || '',
                relevantKnowledge
              )

              // Enviar resposta via Evolution API
              if (process.env.NEXT_PUBLIC_EVOLUTION_API_URL && process.env.NEXT_PUBLIC_EVOLUTION_API_KEY) {
                evolutionService.initialize({
                  baseUrl: process.env.NEXT_PUBLIC_EVOLUTION_API_URL,
                  apiKey: process.env.NEXT_PUBLIC_EVOLUTION_API_KEY,
                  webhook: process.env.NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL
                })

                // Assumindo que há uma instância ativa (você pode melhorar isso)
                const instances = await evolutionService.getInstances?.() || []
                if (instances.length > 0) {
                  const activeInstance = instances.find(i => i.status === 'connected') || instances[0]

                  await evolutionService.sendTextMessage(
                    activeInstance.name,
                    contact.phone,
                    ragResponse.answer
                  )

                  // Salvar resposta RAG no banco
                  await supabaseDataService.createMessage({
                    conversation_id: conversation.id,
                    from_phone: null,
                    to_phone: contact.phone,
                    body: ragResponse.answer,
                    message_type: 'text',
                    is_from_bot: true,
                    status: 'sent',
                    metadata: {
                      rag_response: true,
                      confidence: ragResponse.confidence,
                      sources: ragResponse.sources
                    },
                    timestamp: new Date()
                  })
                }
              }
            } catch (ragError) {
              console.error('Erro ao gerar resposta RAG:', ragError)
            }
          }
        }

        // 5. Atualizar última atividade da conversa
        await supabaseDataService.updateConversation(conversation.id, {
          last_message_at: message.timestamp,
          updated_at: new Date()
        })

      } catch (dbError) {
        console.error('Erro ao salvar no banco:', dbError)
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processado com sucesso' })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint ativo',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  })
}

// Funções auxiliares
function shouldTriggerRule(rule: any, message: any, conversation: any): boolean {
  // Implementar lógica de verificação de regras de automação
  if (rule.trigger_type === 'keyword') {
    const keywords = rule.trigger_config?.keywords || []
    return keywords.some((keyword: string) =>
      message.body.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  if (rule.trigger_type === 'first_message') {
    // Verificar se é a primeira mensagem da conversa
    return conversation.messages?.length <= 1
  }

  return false
}

async function executeAutomationRule(rule: any, message: any, conversation: any): Promise<void> {
  if (rule.action_type === 'send_message') {
    const config = rule.action_config
    const responseMessage = config?.message || 'Resposta automática'

    // Aqui você implementaria o envio da mensagem automática
    console.log('Executando regra de automação:', rule.name, 'Mensagem:', responseMessage)
  }
}

async function shouldGenerateRAGResponse(conversation: any, message: any): boolean {
  // Implementar lógica para determinar se deve gerar resposta RAG
  // Por exemplo, verificar se há agente humano disponível, horário comercial, etc.

  // Por enquanto, sempre gerar resposta RAG para mensagens não-bot
  return !message.isFromBot && message.type === 'text'
} 