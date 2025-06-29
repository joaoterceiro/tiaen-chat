'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge,
  Avatar,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  Textarea,
  Alert,
  AlertDescription
} from '@/components/ui'
import { 
  Search, 
  Plus, 
  Phone, 
  MessageSquare, 
  Edit, 
  Trash2,
  User,
  Calendar,
  Mail,
  ArrowLeft
} from 'lucide-react'
import { supabaseDataService } from '@/services/supabase-data'
import { Database } from '@/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Contact = Database['public']['Tables']['contacts']['Row']
type ContactInsert = Database['public']['Tables']['contacts']['Insert']

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<ContactInsert>>({
    name: '',
    phone: '',
    notes: '',
    tags: [],
    metadata: {}
  })

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchQuery])

  const loadContacts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await supabaseDataService.getContacts()
      setContacts(data)
    } catch (err) {
      console.error('Erro ao carregar contatos:', err)
      setError('Erro ao carregar contatos')
    } finally {
      setIsLoading(false)
    }
  }

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.phone.includes(query) ||
      contact.notes?.toLowerCase().includes(query) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(query))
    )
    setFilteredContacts(filtered)
  }

  const handleCreateContact = () => {
    setFormData({
      name: '',
      phone: '',
      notes: '',
      tags: [],
      metadata: {}
    })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      notes: contact.notes,
      tags: contact.tags,
      metadata: contact.metadata
    })
    setSelectedContact(contact)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleSaveContact = async () => {
    try {
      if (!formData.name?.trim() || !formData.phone?.trim()) {
        setError('Nome e telefone são obrigatórios')
        return
      }

      // Validar formato do telefone (básico)
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/
      if (!phoneRegex.test(formData.phone)) {
        setError('Formato de telefone inválido')
        return
      }

      if (isEditing && selectedContact) {
        const updated = await supabaseDataService.updateContact(selectedContact.id, formData)
        setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))
      } else {
        // Garantir que os campos obrigatórios estão presentes
        const contactData: ContactInsert = {
          name: formData.name!,
          phone: formData.phone!,
          notes: formData.notes || null,
          tags: formData.tags || [],
          metadata: formData.metadata || {},
          is_online: false,
          profile_picture: null
        }
        
        const created = await supabaseDataService.createContact(contactData)
        setContacts(prev => [created, ...prev])
      }

      setIsModalOpen(false)
      setSelectedContact(null)
      setError(null)
      setFormData({
        name: '',
        phone: '',
        notes: '',
        tags: [],
        metadata: {}
      })
    } catch (err) {
      console.error('Erro ao salvar contato:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao salvar contato'
      setError(`Erro ao salvar contato: ${errorMessage}`)
    }
  }

  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm(`Tem certeza que deseja excluir o contato ${contact.name}?`)) {
      return
    }

    try {
      // Note: Implementar delete no serviço se necessário
      console.log('Delete não implementado ainda')
    } catch (err) {
      console.error('Erro ao excluir contato:', err)
      setError('Erro ao excluir contato')
    }
  }

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'success' : 'secondary'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Link>
                </Button>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900">Contatos</h1>
              </div>
              <Badge variant="success">Carregando...</Badge>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-secondary-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-secondary-900">Contatos</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="success" className="hidden sm:flex">
                {contacts.length} contatos
              </Badge>
              <Button onClick={handleCreateContact} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Contato
              </Button>
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
                Gerenciar Contatos 📞
              </h1>
              <p className="text-secondary-600">
                Organize e gerencie todos os seus contatos do WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <Input
                placeholder="Buscar contatos por nome, telefone, notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary-900">{contacts.length}</p>
                  <p className="text-sm text-secondary-600">Total de Contatos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary-900">
                    {contacts.filter(c => c.is_online).length}
                  </p>
                  <p className="text-sm text-secondary-600">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary-900">
                    {contacts.filter(c => {
                      const today = new Date()
                      const contactDate = new Date(c.created_at)
                      return contactDate.toDateString() === today.toDateString()
                    }).length}
                  </p>
                  <p className="text-sm text-secondary-600">Novos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-secondary-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                {searchQuery ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
              </h3>
              <p className="text-secondary-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Tente ajustar sua busca ou criar um novo contato'
                  : 'Comece adicionando seu primeiro contato para gerenciar suas conversas'
                }
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateContact} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Contato
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} variant="elevated" className="hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  {/* Contact Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        size="lg"
                        src={contact.profile_picture || undefined}
                        fallback={contact.name.charAt(0).toUpperCase()}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-secondary-900 truncate text-lg">
                          {contact.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={getStatusColor(contact.is_online) as any}
                            className="text-xs"
                          >
                            {contact.is_online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContact(contact)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContact(contact)}
                        className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-700 font-medium">{contact.phone}</span>
                    </div>

                    {contact.notes && (
                      <p className="text-secondary-600 text-sm line-clamp-2 bg-secondary-50 p-3 rounded-lg">
                        {contact.notes}
                      </p>
                    )}

                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {contact.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{contact.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contact Footer */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-100">
                    <span className="text-xs text-secondary-500">
                      {format(new Date(contact.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-3 w-3 mr-1" />
                        Ligar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact Modal */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {isEditing ? 'Editar Contato' : 'Novo Contato'}
              </ModalTitle>
              <ModalDescription>
                {isEditing 
                  ? 'Atualize as informações do contato'
                  : 'Adicione um novo contato à sua lista'
                }
              </ModalDescription>
            </ModalHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nome *
                  </label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do contato"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Telefone *
                  </label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Notas
                </label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anotações sobre o contato..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <Input
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="cliente, vip, suporte"
                />
              </div>
            </div>

            <ModalFooter>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveContact}>
                {isEditing ? 'Atualizar' : 'Criar'} Contato
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
} 