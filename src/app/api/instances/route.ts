import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { EvolutionAPI } from '@/lib/evolution/api'
import type { Database } from '@/types/database'

// Schema de validação para criação de instância
const createInstanceSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  aiEnabled: z.boolean().default(true),
  model: z.string().default('gpt-3.5-turbo'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
  systemPrompt: z.string().optional()
})

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Initialize Evolution API
const evolutionApi = new EvolutionAPI(
  process.env.EVOLUTION_API_URL!,
  process.env.EVOLUTION_API_KEY!,
  supabase
)

export async function GET(req: NextRequest) {
  try {
    // Get user session from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's instances
    const { data: instances, error } = await supabase
      .from('evolution_instances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ instances })
  } catch (error) {
    console.error('Error fetching instances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instances' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user session from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await req.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create instance
    const result = await evolutionApi.createInstance(name, description)
    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error creating instance:', error)
    return NextResponse.json(
      { error: 'Failed to create instance' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get user session from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get instance ID from query params
    const { searchParams } = new URL(req.url)
    const instanceId = searchParams.get('id')

    if (!instanceId) {
      return NextResponse.json(
        { error: 'Instance ID is required' },
        { status: 400 }
      )
    }

    // Verify instance belongs to user
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_instances')
      .select('id')
      .eq('id', instanceId)
      .eq('user_id', user.id)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      )
    }

    // Delete instance
    const result = await evolutionApi.deleteInstance(instanceId)
    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting instance:', error)
    return NextResponse.json(
      { error: 'Failed to delete instance' },
      { status: 500 }
    )
  }
} 