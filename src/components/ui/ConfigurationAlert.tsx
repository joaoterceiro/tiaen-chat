'use client'

import { Alert, AlertDescription, Button } from '@/components/ui'
import { Settings, ExternalLink, Copy, AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabaseDataService } from '@/services/supabase-data'
import { cn } from '@/lib/utils'

interface ConfigurationAlertProps {
  type: 'error' | 'warning' | 'success' | 'info'
  title: string
  message: string
  className?: string
  onClose?: () => void
}

export function ConfigurationAlert({
  type,
  title,
  message,
  className,
  onClose
}: ConfigurationAlertProps) {
  const icons = {
    error: <XCircle className="h-5 w-5 text-error-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
    success: <CheckCircle className="h-5 w-5 text-success-500" />,
    info: <AlertCircle className="h-5 w-5 text-info-500" />
  }

  const styles = {
    error: 'bg-error-50 border-error-200 text-error-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    success: 'bg-success-50 border-success-200 text-success-700',
    info: 'bg-info-50 border-info-200 text-info-700'
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        styles[type],
        className
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      
      <div className="flex-1 space-y-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm opacity-90">{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-full p-1 hover:bg-black/5"
        >
          <XCircle className="h-4 w-4 opacity-50" />
        </button>
      )}
    </div>
  )
}

interface ConfigurationAlertProps {
  error?: string
  forceShow?: boolean
}

export default function ConfigurationAlert({ error, forceShow = false }: ConfigurationAlertProps) {
  const [copied, setCopied] = useState(false)
  const [shouldShow, setShouldShow] = useState(true)

  // Verificar se o sistema já está configurado
  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const systemConfigured = await supabaseDataService.getSystemSetting('system_configured')
        if (systemConfigured?.value === 'true' && !forceShow) {
          setShouldShow(false)
        }
      } catch (error) {
        console.error('Erro ao verificar configuração:', error)
      }
    }
    checkConfiguration()
  }, [forceShow])

  // Se não deve mostrar, retorna null
  if (!shouldShow) return null

  const isSupabaseError = error?.includes('Supabase') || error?.includes('.env.local')

  const copyEnvExample = async () => {
    const envExample = `# Configurações do Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# OpenAI Configuration (opcional)
OPENAI_API_KEY=sk-your-openai-key-here

# Evolution API Configuration (opcional)
EVOLUTION_API_URL=https://your-evolution-api.com
EVOLUTION_API_KEY=your-evolution-api-key-here`

    try {
      await navigator.clipboard.writeText(envExample)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  if (!isSupabaseError) {
    return (
      <Alert variant="error" className="mb-6">
        <Settings className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 mb-6">
      <Alert variant="error">
        <Settings className="h-4 w-4" />
        <AlertDescription className="font-medium">
          {error}
        </AlertDescription>
      </Alert>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-800 mb-2">
          🔧 Como resolver este problema:
        </h3>
        
        <div className="space-y-3 text-sm text-orange-700">
          <div>
            <p className="font-medium">1. Criar projeto no Supabase:</p>
            <div className="flex items-center gap-2 mt-1">
              <a 
                href="https://supabase.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-800 underline flex items-center gap-1"
              >
                Acessar Supabase <ExternalLink className="h-3 w-3" />
              </a>
              <span>→ New Project → Copiar credenciais</span>
            </div>
          </div>

          <div>
            <p className="font-medium">2. Criar arquivo .env.local na raiz:</p>
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyEnvExample}
                className="text-xs bg-white border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Copy className="h-3 w-3 mr-1" />
                {copied ? 'Copiado!' : 'Copiar template'}
              </Button>
            </div>
          </div>

          <div>
            <p className="font-medium">3. Configurar banco:</p>
            <p>SQL Editor → Executar scripts:</p>
            <ul className="list-disc list-inside ml-4">
              <li>database/supabase-schema.sql</li>
              <li>database/sample-data.sql</li>
            </ul>
          </div>

          <div>
            <p className="font-medium">4. Reiniciar: npm run dev</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-orange-200">
          <p className="text-xs text-orange-600">
            📖 Veja CONFIGURACAO.md para instruções completas
          </p>
        </div>
      </div>
    </div>
  )
} 