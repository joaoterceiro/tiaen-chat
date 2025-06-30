import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { EvolutionAPI } from '@/lib/evolution/api';

// Initialize Evolution API
const evolutionApi = new EvolutionAPI(
  process.env.EVOLUTION_API_URL!,
  process.env.EVOLUTION_API_KEY!,
  createRouteHandlerClient({ cookies })
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify instance belongs to user
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_instances')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Get chat messages
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('instance_id', params.id)
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify instance belongs to user
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_instances')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Get AI configuration
    const { data: aiConfig, error: aiError } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('instance_id', params.id)
      .single();

    if (aiError && aiError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw aiError;
    }

    // Process message with AI if configuration exists and is active
    if (aiConfig?.is_active) {
      const result = await evolutionApi.processMessage({
        instanceId: params.id,
        phone,
        message,
        aiConfig
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return NextResponse.json({
        success: true,
        response: result.data
      });
    } else {
      // Send message without AI processing
      const result = await evolutionApi.sendMessage({
        instanceId: params.id,
        phone,
        message
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 