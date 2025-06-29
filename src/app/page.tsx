import Link from 'next/link'
import { Button } from '@/components/ui'
import { PageContainer, PageHeader, PageContent } from '@/components/layout'

export default function Home() {
  return (
    <PageContainer variant="centered" minHeight="screen" withPadding={false}>
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center py-24">
        <div className="text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-primary mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-gradient-primary mb-6">
            Bem-vindo ao Tiaen Chat
          </h1>
          
          <p className="text-xl text-secondary-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Uma aplicação moderna de chat construída com Next.js e autenticação segura via Supabase. 
            Conecte-se, converse e compartilhe momentos de forma simples e intuitiva.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="min-w-[160px]">
              <Link href="/auth/login">
                Fazer Login
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="min-w-[160px]">
              <Link href="/dashboard">
                Ver Dashboard
              </Link>
            </Button>
            
            <Button asChild variant="ghost" size="lg" className="min-w-[160px]">
              <Link href="/components">
                Design System
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Seguro</h3>
              <p className="text-secondary-600 text-sm">Autenticação robusta com Supabase</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Rápido</h3>
              <p className="text-secondary-600 text-sm">Interface otimizada e responsiva</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Intuitivo</h3>
              <p className="text-secondary-600 text-sm">Design pensado na experiência do usuário</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
} 