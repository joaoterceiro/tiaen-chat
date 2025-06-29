import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  Badge, 
  Avatar 
} from '@/components/ui'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { ConversationMetrics } from '@/components/dashboard/ConversationMetrics'
import { EvolutionQuickActions } from '@/components/dashboard/EvolutionQuickActions'

export default async function DashboardPage() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect('/auth/login')
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      redirect('/auth/login')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-secondary-900">Tiaen Chat</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">
                    Início
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/rag">
                    Sistema RAG
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar 
                    size="sm" 
                    fallback={session.user.email?.charAt(0).toUpperCase() || 'U'} 
                  />
                  <span className="text-sm text-secondary-700 hidden sm:block">
                    {session.user.email}
                  </span>
                </div>
                <form action="/auth/signout" method="post">
                  <Button type="submit" variant="destructive" size="sm">
                    Sair
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                  Bem-vindo de volta! 👋
                </h1>
                <p className="text-secondary-600">
                  Aqui está um resumo das suas atividades hoje
                </p>
              </div>
              <Badge variant="success" className="hidden sm:flex">
                Sistema Online
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <DashboardStats />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Conversation Metrics */}
            <div className="lg:col-span-2">
              <ConversationMetrics />
            </div>

            {/* Quick Actions */}
            <div>
              <QuickActions />
            </div>

            {/* Evolution Quick Actions */}
            <div>
              <EvolutionQuickActions />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Evolution API Card */}
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Evolution API</CardTitle>
                <CardDescription>
                  Gerenciar instâncias WhatsApp e conexões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Instâncias Ativas</span>
                    <Badge variant="success">2</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Status</span>
                    <Badge variant="success">Online</Badge>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link href="/evolution">
                      Gerenciar Instâncias
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RAG System Card */}
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Sistema RAG</CardTitle>
                <CardDescription>
                  Inteligência artificial para respostas automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Base de Conhecimento</span>
                    <Badge variant="primary">24 itens</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Automações Ativas</span>
                    <Badge variant="success">8 regras</Badge>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link href="/rag">
                      Acessar Sistema RAG
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conversations Card */}
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Conversas WhatsApp</CardTitle>
                <CardDescription>
                  Chat em tempo real e gerenciamento de mensagens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Conversas Ativas</span>
                    <Badge variant="warning">12</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Pendentes</span>
                    <Badge variant="error">3</Badge>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link href="/conversas">
                      Abrir Chat WhatsApp
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>
                  Métricas e relatórios detalhados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Taxa de Conversão</span>
                    <Badge variant="success">94%</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Satisfação</span>
                    <Badge variant="success">4.8/5</Badge>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/analytics">
                      Ver Relatórios
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contacts Card */}
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Contatos</CardTitle>
                <CardDescription>
                  Gerencie sua base de contatos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Total de Contatos</span>
                    <Badge variant="primary">856</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Novos Hoje</span>
                    <Badge variant="success">+23</Badge>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/contacts">
                      Gerenciar Contatos
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    redirect('/auth/login')
  }
} 