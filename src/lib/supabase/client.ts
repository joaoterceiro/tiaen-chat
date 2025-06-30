import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is required. Please check your .env.local file.'
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your .env.local file.'
    )
  }

  try {
    const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

    // Habilitar realtime para as tabelas necessárias
    client.channel('chat_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        console.log('Realtime update:', payload)
      })
      .subscribe()

    return client
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw new Error('Failed to initialize Supabase client. Please check your configuration.')
  }
}

// Para compatibilidade com o código existente
export const supabase = createClient() 