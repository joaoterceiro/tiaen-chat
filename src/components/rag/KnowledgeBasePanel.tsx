'use client'

import { useState } from 'react'
import { 
  Button, 
  Input, 
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Alert,
  AlertDescription
} from '@/components/ui'
import { useRAG } from '@/contexts/RAGContext'
import { KnowledgeBase } from '@/types/rag'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Brain, 
  Tag,
  Calendar,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function KnowledgeBasePanel() {
  const { 
    knowledgeBase, 
    addKnowledge, 
    updateKnowledge, 
    deleteKnowledge,
    isLoading 
  } = useRAG()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeBase | null>(null)

  const categories = Array.from(new Set(knowledgeBase.map(kb => kb.category)))

  const filteredKnowledge = knowledgeBase.filter(kb => {
    const matchesSearch = searchQuery === '' || 
      kb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === 'all' || kb.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-secondary-900">Base de Conhecimento</h3>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <Input
            placeholder="Buscar conhecimento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter} placeholder="Categoria">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Knowledge List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredKnowledge.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary-500">
            <Brain className="h-12 w-12 mb-2" />
            <p className="text-sm">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Nenhum conhecimento encontrado' 
                : 'Nenhum conhecimento cadastrado'
              }
            </p>
          </div>
        ) : (
          filteredKnowledge.map((kb) => (
            <KnowledgeItem
              key={kb.id}
              knowledge={kb}
              onEdit={(kb) => setEditingKnowledge(kb)}
              onDelete={(id) => deleteKnowledge(id)}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <ModalContent>
            <KnowledgeForm 
              onSubmit={async (data) => {
                await addKnowledge(data)
                setIsAddModalOpen(false)
              }}
              onCancel={() => setIsAddModalOpen(false)}
              isLoading={isLoading}
            />
          </ModalContent>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingKnowledge && (
        <Modal open={true} onClose={() => setEditingKnowledge(null)}>
          <ModalContent>
            <KnowledgeForm
              knowledge={editingKnowledge}
              onSubmit={async (data) => {
                await updateKnowledge(editingKnowledge.id, data)
                setEditingKnowledge(null)
              }}
              onCancel={() => setEditingKnowledge(null)}
              isLoading={isLoading}
            />
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}

interface KnowledgeItemProps {
  knowledge: KnowledgeBase
  onEdit: (knowledge: KnowledgeBase) => void
  onDelete: (id: string) => void
}

function KnowledgeItem({ knowledge, onEdit, onDelete }: KnowledgeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-secondary-900 truncate">
            {knowledge.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {knowledge.category}
            </Badge>
            <Badge 
              variant={knowledge.isActive ? 'success' : 'secondary'} 
              className="text-xs"
            >
              {knowledge.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(knowledge)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(knowledge.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content Preview */}
      <p className="text-sm text-secondary-600 line-clamp-2 mb-2">
        {knowledge.content}
      </p>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-secondary-100">
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-secondary-700">Conteúdo:</span>
              <p className="text-sm text-secondary-600 mt-1 whitespace-pre-wrap">
                {knowledge.content}
              </p>
            </div>
            
            {knowledge.tags.length > 0 && (
              <div>
                <span className="text-xs font-medium text-secondary-700">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {knowledge.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-secondary-500">
              <div>Criado: {format(new Date(knowledge.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
              <div>Atualizado: {format(new Date(knowledge.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {!isExpanded && knowledge.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {knowledge.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {knowledge.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{knowledge.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-secondary-100 text-xs text-secondary-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {format(new Date(knowledge.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>{knowledge.content.length} chars</span>
        </div>
      </div>
    </div>
  )
}

interface KnowledgeFormProps {
  knowledge?: KnowledgeBase
  onSubmit: (data: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

function KnowledgeForm({ knowledge, onSubmit, onCancel, isLoading }: KnowledgeFormProps) {
  const [formData, setFormData] = useState({
    title: knowledge?.title || '',
    content: knowledge?.content || '',
    category: knowledge?.category || '',
    tags: knowledge?.tags.join(', ') || '',
    isActive: knowledge?.isActive ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category.trim(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isActive: formData.isActive
    }

    await onSubmit(data)
  }

  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {knowledge ? 'Editar Conhecimento' : 'Adicionar Conhecimento'}
        </ModalTitle>
        <ModalDescription>
          {knowledge 
            ? 'Edite as informações do conhecimento abaixo.'
            : 'Adicione um novo conhecimento à base de dados.'
          }
        </ModalDescription>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Título
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título do conhecimento"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Categoria
          </label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: FAQ, Produtos, Suporte"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Conteúdo
          </label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Conteúdo detalhado do conhecimento..."
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Tags (separadas por vírgula)
          </label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-secondary-300"
          />
          <label htmlFor="isActive" className="text-sm text-secondary-700">
            Conhecimento ativo
          </label>
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : knowledge ? 'Atualizar' : 'Adicionar'}
          </Button>
        </ModalFooter>
      </form>
    </>
  )
} 