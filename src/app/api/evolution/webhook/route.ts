import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.EVOLUTION_WEBHOOK_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const {
      instanceId,
      event,
      data
    } = body;

    switch (event) {
      case 'message':
        // Handle incoming message
        await supabase
          .from('chat_messages')
          .insert({
            instance_id: instanceId,
            phone_number: data.from,
            message: data.body,
            is_bot: false,
            metadata: {
              messageId: data.id,
              timestamp: data.timestamp,
              type: data.type
            }
          });
        break;

      case 'status':
        // Update instance status
        await supabase
          .from('evolution_instances')
          .update({
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', instanceId);
        break;

      case 'qr':
        // Update QR code
        await supabase
          .from('evolution_instances')
          .update({
            qr_code: data.qrCode,
            updated_at: new Date().toISOString()
          })
          .eq('id', instanceId);
        break;

      case 'disconnect':
        // Handle disconnection
        await supabase
          .from('evolution_instances')
          .update({
            status: 'disconnected',
            qr_code: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', instanceId);
        break;

      default:
        console.warn(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 