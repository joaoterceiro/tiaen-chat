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
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Switch
} from '@/components/ui'
import { useRAG } from '@/contexts/RAGContext'
import { AutomationRule } from '@/types/rag'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Zap, 
  Power,
  PowerOff,
  Clock,
  MessageSquare,
  Heart,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AutomationPanel() {
  const { 
    automationRules, 
    addAutomationRule, 
    updateAutomationRule, 
    deleteAutomationRule 
  } = useRAG()

  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)

  const filteredRules = automationRules.filter(rule =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleRuleStatus = (rule: AutomationRule) => {
    updateAutomationRule(rule.id, { isActive: !rule.isActive })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-secondary-900">Automação</h3>
          <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
            <ModalTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nova Regra
              </Button>
            </ModalTrigger>
            <ModalContent>
              <AutomationForm 
                onSubmit={(data) => {
                  addAutomationRule(data)
                  setIsAddModalOpen(false)
                }}
                onCancel={() => setIsAddModalOpen(false)}
              />
            </ModalContent>
          </Modal>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <Input
            placeholder="Buscar regras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Rules List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary-500">
            <Zap className="h-12 w-12 mb-2" />
            <p className="text-sm">
              {searchQuery 
                ? 'Nenhuma regra encontrada' 
                : 'Nenhuma regra de automação criada'
              }
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <RuleItem
              key={rule.id}
              rule={rule}
              onEdit={(rule) => setEditingRule(rule)}
              onDelete={(id) => deleteAutomationRule(id)}
              onToggle={toggleRuleStatus}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingRule && (
        <Modal open={true} onClose={() => setEditingRule(null)}>
          <ModalContent>
            <AutomationForm
              rule={editingRule}
              onSubmit={(data) => {
                updateAutomationRule(editingRule.id, data)
                setEditingRule(null)
              }}
              onCancel={() => setEditingRule(null)}
            />
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}

interface RuleItemProps {
  rule: AutomationRule
  onEdit: (rule: AutomationRule) => void
  onDelete: (id: string) => void
  onToggle: (rule: AutomationRule) => void
}

function RuleItem({ rule, onEdit, onDelete, onToggle }: RuleItemProps) {
  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'keyword': return <MessageSquare className="h-4 w-4" />
      case 'time': return <Clock className="h-4 w-4" />
      case 'sentiment': return <Heart className="h-4 w-4" />
      case 'first_message': return <User className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'keyword': return 'Palavra-chave'
      case 'time': return 'Tempo'
      case 'sentiment': return 'Sentimento'
      case 'first_message': return 'Primeira mensagem'
      default: return type
    }
  }

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'send_message': return 'Enviar mensagem'
      case 'transfer_agent': return 'Transferir para agente'
      case 'add_tag': return 'Adicionar tag'
      case 'create_ticket': return 'Criar ticket'
      default: return type
    }
  }

  return (
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-secondary-900 truncate">
              {rule.name}
            </h4>
            <Badge 
              variant={rule.isActive ? 'success' : 'secondary'} 
              className="text-xs"
            >
              {rule.isActive ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          <p className="text-sm text-secondary-600 line-clamp-2">
            {rule.description}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(rule)}
          >
            {rule.isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(rule)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(rule.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Trigger and Action */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-secondary-600">
            {getTriggerIcon(rule.trigger.type)}
            <span className="font-medium">Gatilho:</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {getTriggerLabel(rule.trigger.type)}
          </Badge>
          <span className="text-secondary-600">→</span>
          <span className="font-mono text-xs bg-secondary-100 px-2 py-1 rounded">
            {rule.trigger.value}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-secondary-600">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Ação:</span>
          </div>
          <Badge variant="primary" className="text-xs">
            {getActionLabel(rule.action.type)}
          </Badge>
          {rule.action.value && (
            <>
              <span className="text-secondary-600">→</span>
              <span className="font-mono text-xs bg-primary-100 px-2 py-1 rounded">
                {rule.action.value}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-secondary-100 text-xs text-secondary-500">
        <div className="flex items-center justify-between">
          <span>
            Criada: {format(new Date(rule.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
          <span>
            Atualizada: {format(new Date(rule.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </span>
        </div>
      </div>
    </div>
  )
}

interface AutomationFormProps {
  rule?: AutomationRule
  onSubmit: (data: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function AutomationForm({ rule, onSubmit, onCancel }: AutomationFormProps) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    triggerType: rule?.trigger.type || 'keyword',
    triggerValue: rule?.trigger.value || '',
    actionType: rule?.action.type || 'send_message',
    actionValue: rule?.action.value || '',
    isActive: rule?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      trigger: {
        type: formData.triggerType as any,
        value: formData.triggerValue.trim()
      },
      action: {
        type: formData.actionType as any,
        value: formData.actionValue.trim()
      },
      isActive: formData.isActive
    }

    onSubmit(data)
  }

  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {rule ? 'Editar Regra' : 'Nova Regra de Automação'}
        </ModalTitle>
        <ModalDescription>
          {rule 
            ? 'Edite a regra de automação abaixo.'
            : 'Crie uma nova regra de automação para o sistema.'
          }
        </ModalDescription>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Nome da Regra
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Resposta automática para saudações"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Descrição
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva o que esta regra faz..."
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Tipo de Gatilho
            </label>
            <Select 
              value={formData.triggerType} 
              onValueChange={(value) => 
                setFormData({ ...formData, triggerType: value as 'keyword' | 'time' | 'sentiment' | 'first_message' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword">Palavra-chave</SelectItem>
                <SelectItem value="time">Tempo</SelectItem>
                <SelectItem value="sentiment">Sentimento</SelectItem>
                <SelectItem value="first_message">Primeira mensagem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Valor do Gatilho
            </label>
            <Input
              value={formData.triggerValue}
              onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
              placeholder={
                formData.triggerType === 'keyword' ? 'olá, oi, bom dia' :
                formData.triggerType === 'time' ? '30' :
                formData.triggerType === 'sentiment' ? 'negative' :
                'qualquer'
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Tipo de Ação
            </label>
            <Select 
              value={formData.actionType} 
              onValueChange={(value) => 
                setFormData({ ...formData, actionType: value as 'send_message' | 'transfer_agent' | 'add_tag' | 'create_ticket' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_message">Enviar mensagem</SelectItem>
                <SelectItem value="transfer_agent">Transferir para agente</SelectItem>
                <SelectItem value="add_tag">Adicionar tag</SelectItem>
                <SelectItem value="create_ticket">Criar ticket</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Valor da Ação
            </label>
            <Input
              value={formData.actionValue}
              onChange={(e) => setFormData({ ...formData, actionValue: e.target.value })}
              placeholder={
                formData.actionType === 'send_message' ? 'Olá! Como posso ajudar?' :
                formData.actionType === 'transfer_agent' ? 'suporte' :
                formData.actionType === 'add_tag' ? 'novo_cliente' :
                'Ticket criado automaticamente'
              }
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <label className="text-sm text-secondary-700">
            Regra ativa
          </label>
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {rule ? 'Atualizar' : 'Criar Regra'}
          </Button>
        </ModalFooter>
      </form>
    </>
  )
} 