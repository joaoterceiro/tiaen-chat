'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertTitle, AlertDescription, Spinner } from '@/components/ui'

function getRedirectParams() {
  if (typeof window === 'undefined') return ''
  
  const urlParams = new URLSearchParams(window.location.search)
  const redirectedFrom = urlParams.get('redirectedFrom')
  
  if (redirectedFrom) {
    return `?next=${encodeURIComponent(redirectedFrom)}`
  }
  
  return '?next=%2Fdashboard'
}

export function AuthForm() {
  const [supabase, setSupabase] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)

      // Escutar mudanças de autenticação
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Redirecionar para dashboard após login bem-sucedido
          router.push('/dashboard')
        }
      })

      return () => subscription.unsubscribe()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inicializar Supabase')
    }
  }, [router])

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Erro de Configuração</AlertTitle>
        <AlertDescription>
          {error}
          <br />
          <span className="text-xs mt-1 block">
            Consulte o arquivo CONFIGURACAO.md para instruções de configuração.
          </span>
        </AlertDescription>
      </Alert>
    )
  }

  if (!supabase) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Spinner size="lg" />
        <p className="mt-4 text-secondary-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#FF6A00',
                brandAccent: '#E55100',
                defaultButtonBackground: '#FF6A00',
                defaultButtonBackgroundHover: '#E55100',
                inputBorder: '#E2E8F0',
                inputBorderHover: '#FF6A00',
                inputBorderFocus: '#FF6A00',
              },
              borderWidths: {
                buttonBorderWidth: '1px',
                inputBorderWidth: '1px',
              },
              radii: {
                borderRadiusButton: '0.5rem',
                buttonBorderRadius: '0.5rem',
                inputBorderRadius: '0.5rem',
              },
            },
          },
        }}
        theme="light"
        providers={['google', 'github']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/auth/callback${getRedirectParams()}`}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Senha',
              email_input_placeholder: 'Seu email',
              password_input_placeholder: 'Sua senha',
              button_label: 'Entrar',
              loading_button_label: 'Entrando...',
              social_provider_text: 'Entrar com {{provider}}',
              link_text: 'Já tem uma conta? Entre aqui',
            },
            sign_up: {
              email_label: 'Email',
              password_label: 'Senha',
              email_input_placeholder: 'Seu email',
              password_input_placeholder: 'Sua senha',
              button_label: 'Cadastrar',
              loading_button_label: 'Cadastrando...',
              social_provider_text: 'Cadastrar com {{provider}}',
              link_text: 'Não tem uma conta? Cadastre-se',
            },
            forgotten_password: {
              email_label: 'Email',
              password_label: 'Senha',
              email_input_placeholder: 'Seu email',
              button_label: 'Enviar instruções',
              loading_button_label: 'Enviando...',
              link_text: 'Esqueceu sua senha?',
            },
          },
        }}
      />
    </div>
  )
} 