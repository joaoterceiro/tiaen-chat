import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { EvolutionAPI } from '@/lib/evolution/api'

// Schema de validação para atualização de instância
const updateInstanceSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['connected', 'disconnected', 'connecting']).optional(),
  qr_code: z.string().optional(),
  webhook_url: z.string().url().optional(),
  aiConfig: z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().min(100).max(4000).optional(),
    system_prompt: z.string().optional(),
    is_active: z.boolean().optional()
  }).optional()
})

// Initialize Evolution API
const evolutionApi = new EvolutionAPI(
  process.env.EVOLUTION_API_URL!,
  process.env.EVOLUTION_API_KEY!,
  createRouteHandlerClient({ cookies })
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get instance details
    const { data: instance, error } = await supabase
      .from('evolution_instances')
      .select(`
        *,
        ai_configurations (*),
        rag_documents (*)
      `)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (error || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      )
    }

    // Get current status from Evolution API
    const statusResult = await evolutionApi.getInstanceStatus(params.id)
    if (statusResult.success) {
      instance.status = statusResult.data?.status
      instance.qr_code = statusResult.data?.qrCode
    }

    return NextResponse.json(instance)
  } catch (error) {
    console.error('Error fetching instance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instance' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validar dados
    const validatedData = updateInstanceSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Atualizar instância
    const instanceUpdate: any = {}
    if (validatedData.name) instanceUpdate.name = validatedData.name
    if (validatedData.description !== undefined) instanceUpdate.description = validatedData.description
    if (validatedData.status) instanceUpdate.status = validatedData.status
    if (validatedData.qr_code !== undefined) instanceUpdate.qr_code = validatedData.qr_code
    if (validatedData.webhook_url) instanceUpdate.webhook_url = validatedData.webhook_url

    if (Object.keys(instanceUpdate).length > 0) {
      const { error: instanceError } = await supabase
        .from('evolution_instances')
        .update(instanceUpdate)
        .eq('id', params.id)

      if (instanceError) {
        console.error('Erro ao atualizar instância:', instanceError)
        return NextResponse.json(
          { error: 'Erro ao atualizar instância' },
          { status: 500 }
        )
      }
    }

    // Atualizar configuração de IA se fornecida
    if (validatedData.aiConfig) {
      const { error: aiConfigError } = await supabase
        .from('ai_configurations')
        .update({
          model: validatedData.aiConfig.model,
          temperature: validatedData.aiConfig.temperature,
          max_tokens: validatedData.aiConfig.max_tokens,
          system_prompt: validatedData.aiConfig.system_prompt,
          is_active: validatedData.aiConfig.is_active
        })
        .eq('instance_id', params.id)

      if (aiConfigError) {
        console.error('Erro ao atualizar configuração de IA:', aiConfigError)
        return NextResponse.json(
          { error: 'Erro ao atualizar configuração de IA' },
          { status: 500 }
        )
      }
    }

    // Buscar instância atualizada
    const { data: instance, error: getError } = await supabase
      .from('evolution_instances')
      .select(`
        *,
        ai_configurations (*)
      `)
      .eq('id', params.id)
      .single()

    if (getError) {
      console.error('Erro ao buscar instância atualizada:', getError)
      return NextResponse.json(
        { error: 'Erro ao buscar instância atualizada' },
        { status: 500 }
      )
    }

    return NextResponse.json(instance)
  } catch (error) {
    console.error('Erro na API:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Deletar instância (as configurações de IA serão deletadas automaticamente pelo ON DELETE CASCADE)
    const { error } = await supabase
      .from('evolution_instances')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar instância:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar instância' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { name, description, webhook_url } = body

    // Verify instance belongs to user
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_instances')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      )
    }

    // Update instance
    const { data: updatedInstance, error } = await supabase
      .from('evolution_instances')
      .update({
        name,
        description,
        webhook_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedInstance)
  } catch (error) {
    console.error('Error updating instance:', error)
    return NextResponse.json(
      { error: 'Failed to update instance' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { action } = body

    // Verify instance belongs to user
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_instances')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      )
    }

    let result
    switch (action) {
      case 'generateQR':
        result = await evolutionApi.generateQRCode(params.id)
        break
      case 'disconnect':
        result = await evolutionApi.disconnect(params.id)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json(result.data || { success: true })
  } catch (error) {
    console.error('Error performing instance action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
