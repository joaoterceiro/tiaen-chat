import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()

    const { data: instances, error } = await supabase
      .from('evolution_instances')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar instâncias:', error)
      return NextResponse.json({ error: 'Erro ao buscar instâncias' }, { status: 500 })
    }

    return NextResponse.json(instances)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceName, aiEnabled, autoResponse, welcomeMessage } = body

    if (!instanceName) {
      return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('evolution_instances')
      .insert({
        instance_name: instanceName,
        ai_enabled: aiEnabled ?? true,
        auto_response: autoResponse ?? true,
        welcome_message: welcomeMessage || 'Olá! Como posso ajudá-lo hoje?',
        status: 'close',
        webhook_configured: true
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar instância:', error)
      return NextResponse.json({ error: 'Erro ao criar instância' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceName, ...updates } = body

    if (!instanceName) {
      return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 })
    }

    const supabase = createClient()

    // Mapear campos do frontend para o banco
    const dbUpdates: any = {}
    if (updates.aiEnabled !== undefined) dbUpdates.ai_enabled = updates.aiEnabled
    if (updates.autoResponse !== undefined) dbUpdates.auto_response = updates.autoResponse
    if (updates.welcomeMessage !== undefined) dbUpdates.welcome_message = updates.welcomeMessage
    if (updates.status !== undefined) dbUpdates.status = updates.status

    const { data, error } = await supabase
      .from('evolution_instances')
      .update(dbUpdates)
      .eq('instance_name', instanceName)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar instância:', error)
      return NextResponse.json({ error: 'Erro ao atualizar instância' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceName } = body

    if (!instanceName) {
      return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 })
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('evolution_instances')
      .delete()
      .eq('instance_name', instanceName)

    if (error) {
      console.error('Erro ao excluir instância:', error)
      return NextResponse.json({ error: 'Erro ao excluir instância' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Instância excluída com sucesso' })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
