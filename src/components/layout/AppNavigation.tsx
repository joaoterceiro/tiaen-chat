'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Button, 
  Badge,
  Avatar 
} from '@/components/ui'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Bot, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Zap,
  Palette,
  LogOut,
  Bell,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: string
  description?: string
}

interface AppNavigationProps {
  user?: {
    email?: string
    name?: string
  }
}

export function AppNavigation({ user }: AppNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: 'Visão geral do sistema'
    },
    {
      name: 'Conversas',
      href: '/conversas',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: '12',
      description: 'Chat WhatsApp e mensagens'
    },
    {
      name: 'Evolution API',
      href: '/evolution',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Gerenciar instâncias WhatsApp'
    },
    {
      name: 'Sistema RAG',
      href: '/rag',
      icon: <Bot className="h-5 w-5" />,
      description: 'IA e base de conhecimento'
    },
    {
      name: 'Contatos',
      href: '/contacts',
      icon: <Users className="h-5 w-5" />,
      badge: '156',
      description: 'Gerenciar contatos do WhatsApp'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Métricas e relatórios'
    },
    {
      name: 'Automações',
      href: '/rag?tab=automation',
      icon: <Zap className="h-5 w-5" />,
      badge: '8',
      description: 'Regras de automação'
    },
    {
      name: 'Componentes',
      href: '/components',
      icon: <Palette className="h-5 w-5" />,
      description: 'Design System'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href.includes('?tab=')) {
      const [basePath] = href.split('?tab=')
      return pathname === basePath
    }
    return pathname === href
  }

  const handleSignOut = () => {
    // Implementar logout
    window.location.href = '/auth/signout'
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-secondary-200 lg:bg-white lg:pt-5 lg:pb-4">
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary-900">Tiaen Chat</h1>
              <p className="text-xs text-secondary-600">Sistema RAG</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex-1 flex flex-col overflow-y-auto">
          <div className="px-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                )}
              >
                <span className={cn(
                  'mr-3 flex-shrink-0 transition-colors',
                  isActive(item.href) ? 'text-white' : 'text-secondary-400 group-hover:text-secondary-600'
                )}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge 
                    variant={isActive(item.href) ? 'secondary' : 'primary'} 
                    className={cn(
                      'text-xs ml-2',
                      isActive(item.href) ? 'bg-white/20 text-white' : ''
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Status Section */}
          <div className="mt-8 px-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Sistema Online</span>
              </div>
              <div className="space-y-1 text-xs text-green-700">
                <div className="flex justify-between">
                  <span>WhatsApp:</span>
                  <span>Conectado</span>
                </div>
                <div className="flex justify-between">
                  <span>IA:</span>
                  <span>Ativo</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Section */}
        {user && (
          <div className="flex-shrink-0 px-6 pb-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-50 border border-secondary-200">
              <Avatar 
                size="sm"
                fallback={user.email?.charAt(0).toUpperCase() || 'U'}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user.name || user.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-secondary-600 truncate">
                  {user.email || 'usuario@exemplo.com'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-secondary-400 hover:text-secondary-600"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-secondary-900">Tiaen Chat</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="error" 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {user && (
              <Avatar 
                size="sm"
                fallback={user.email?.charAt(0).toUpperCase() || 'U'}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-secondary-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                  )}
                >
                  <span className={cn(
                    'mr-3 flex-shrink-0 transition-colors',
                    isActive(item.href) ? 'text-white' : 'text-secondary-400 group-hover:text-secondary-600'
                  )}>
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant={isActive(item.href) ? 'secondary' : 'primary'} 
                          className={cn(
                            'text-xs',
                            isActive(item.href) ? 'bg-white/20 text-white' : ''
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className={cn(
                        'text-xs mt-1',
                        isActive(item.href) ? 'text-white/80' : 'text-secondary-500'
                      )}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile User Section */}
            {user && (
              <div className="px-4 py-3 border-t border-secondary-200 bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      size="sm"
                      fallback={user.email?.charAt(0).toUpperCase() || 'U'}
                    />
                    <div>
                      <p className="text-sm font-medium text-secondary-900">
                        {user.name || user.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p className="text-xs text-secondary-600">
                        {user.email || 'usuario@exemplo.com'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Spacer for Desktop */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" />
    </>
  )
} 