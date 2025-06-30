import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { EvolutionAPI } from '@/lib/evolution/api'

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

    // Verify instance belongs to user
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_instances')
      .select('id, qr_code')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      )
    }

    // If QR code exists, return it
    if (instance.qr_code) {
      return NextResponse.json({ qrCode: instance.qr_code })
    }

    // Generate new QR code
    const result = await evolutionApi.generateQRCode(params.id)
    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ qrCode: result.data })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
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

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Clear QR code
    const { error } = await supabase
      .from('evolution_instances')
      .update({ qr_code: null })
      .eq('id', params.id)

    if (error) throw error

    // Disconnect instance
    const result = await evolutionApi.disconnect(params.id)
    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing QR code:', error)
    return NextResponse.json(
      { error: 'Failed to clear QR code' },
      { status: 500 }
    )
  }
} 