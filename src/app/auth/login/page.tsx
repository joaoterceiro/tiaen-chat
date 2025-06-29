import { AuthForm } from '@/components/auth/AuthForm'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { PageContainer } from '@/components/layout'

export default function LoginPage() {
  return (
    <PageContainer variant="narrow" minHeight="screen" className="flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-primary mb-4">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Tiaen Chat</h1>
        </div>

        <Card variant="elevated" className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              ← Voltar ao início
            </Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  )
} 