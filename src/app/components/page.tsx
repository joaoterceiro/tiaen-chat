'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  // Core Components
  Alert, Avatar, Badge, Button, Card, CardHeader, CardContent, CardFooter, 
  Input, Modal, Spinner, Textarea, Toast,
  
  // Navigation Components  
  Navigation, NavContainer, NavContent, NavBrand, NavMenu, NavItem, NavToggle, NavMobile,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
  Pagination,
  
  // Layout Components
  Tabs, TabsList, TabsTrigger, TabsContent,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  
  // Form Components
  Checkbox, RadioGroup, Radio, Switch, Select, SelectTrigger, SelectValue, 
  SelectContent, SelectItem, ComboBox, DatePicker, Slider,
  
  // Dropdown Components
  Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator,
  
  // Feedback Components
  Progress, CircularProgress, StepProgress, Tooltip,
  
  // Data Components
  DataTable,
  
  // Loading Components
  Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable
} from '@/components/ui'
import { 
  Palette, 
  Layout, 
  Settings, 
  Zap,
  ArrowLeft
} from 'lucide-react'

export default function ComponentsPage() {
  // State for interactive components
  const [activeTab, setActiveTab] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [switchChecked, setSwitchChecked] = useState(false)
  const [selectValue, setSelectValue] = useState('')
  const [comboValue, setComboValue] = useState('')
  const [dateValue, setDateValue] = useState<Date | undefined>()
  const [sliderValue, setSliderValue] = useState([50])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Sample data for DataTable
  const sampleData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active' },
  ]

  const tableColumns = [
    { id: 'name', header: 'Name', accessorKey: 'name' as const, sortable: true },
    { id: 'email', header: 'Email', accessorKey: 'email' as const, sortable: true },
    { id: 'role', header: 'Role', accessorKey: 'role' as const },
    { 
      id: 'status', 
      header: 'Status', 
      accessorKey: 'status' as const,
      cell: ({ value }: { value: string }) => (
        <Badge variant={value === 'Active' ? 'success' : 'secondary'}>
          {value}
        </Badge>
      )
    },
  ]

  const comboOptions = [
    { value: 'react', label: 'React', group: 'Frontend' },
    { value: 'vue', label: 'Vue.js', group: 'Frontend' },
    { value: 'angular', label: 'Angular', group: 'Frontend' },
    { value: 'node', label: 'Node.js', group: 'Backend' },
    { value: 'python', label: 'Python', group: 'Backend' },
    { value: 'go', label: 'Go', group: 'Backend' },
  ]

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
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-secondary-900">Design System</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="success" className="hidden sm:flex">
                26 Componentes
              </Badge>
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
                Sistema de Design 🎨
              </h1>
              <p className="text-secondary-600">
                Coleção completa de componentes prontos para produção com TypeScript
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbPage>Componentes</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Core Components */}
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                    <Layout className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">Core Components</h3>
                    <p className="text-sm text-secondary-600">Componentes essenciais para construção de UI</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Buttons */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Buttons</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Badges</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                  </div>
                </div>

                {/* Avatars */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Avatars</h4>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" fallback="SM" />
                    <Avatar size="md" fallback="MD" />
                    <Avatar size="lg" fallback="LG" />
                    <Avatar size="xl" fallback="XL" />
                  </div>
                </div>

                {/* Alerts */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Alerts</h4>
                  <div className="space-y-3">
                    <Alert variant="info">
                      <strong>Info:</strong> Esta é uma mensagem informativa.
                    </Alert>
                    <Alert variant="success">
                      <strong>Sucesso:</strong> Ação completada com sucesso.
                    </Alert>
                    <Alert variant="warning">
                      <strong>Aviso:</strong> Por favor, revise sua entrada.
                    </Alert>
                    <Alert variant="error">
                      <strong>Erro:</strong> Algo deu errado.
                    </Alert>
                  </div>
                </div>

                {/* Cards */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Cards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card variant="default">
                      <CardHeader>
                        <h5 className="font-medium">Card Padrão</h5>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-secondary-600">Conteúdo do card padrão.</p>
                      </CardContent>
                    </Card>
                    
                    <Card variant="elevated">
                      <CardHeader>
                        <h5 className="font-medium">Card Elevado</h5>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-secondary-600">Card com sombra elevada.</p>
                      </CardContent>
                    </Card>
                    
                    <Card variant="outlined">
                      <CardHeader>
                        <h5 className="font-medium">Card Outlined</h5>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-secondary-600">Card com borda.</p>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm">Ação</Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-8">
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">Form Components</h3>
                    <p className="text-sm text-secondary-600">Componentes para formulários e entrada de dados</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Inputs */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Text Inputs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Input padrão" />
                    <Input placeholder="Input com erro" error />
                    <Input placeholder="Input desabilitado" disabled />
                    <Textarea placeholder="Textarea" rows={3} />
                  </div>
                </div>

                {/* Form Controls */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Form Controls</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="checkbox" 
                        checked={checkboxChecked}
                        onCheckedChange={setCheckboxChecked}
                      />
                      <label htmlFor="checkbox" className="text-sm">Checkbox</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={switchChecked}
                        onCheckedChange={setSwitchChecked}
                      />
                      <label className="text-sm">Switch</label>
                    </div>

                    <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                      <div className="flex items-center space-x-2">
                        <Radio value="option1" id="option1" />
                        <label htmlFor="option1" className="text-sm">Opção 1</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Radio value="option2" id="option2" />
                        <label htmlFor="option2" className="text-sm">Opção 2</label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Select & ComboBox */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Select & ComboBox</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select value={selectValue} onValueChange={setSelectValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Opção 1</SelectItem>
                        <SelectItem value="option2">Opção 2</SelectItem>
                        <SelectItem value="option3">Opção 3</SelectItem>
                      </SelectContent>
                    </Select>

                    <ComboBox
                      options={comboOptions}
                      value={comboValue}
                      onValueChange={setComboValue}
                      placeholder="Buscar tecnologia..."
                      emptyText="Nenhuma tecnologia encontrada"
                    />
                  </div>
                </div>

                {/* Date Picker & Slider */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Date Picker & Slider</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DatePicker
                      value={dateValue}
                      onChange={setDateValue}
                      placeholder="Selecione uma data"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Slider: {sliderValue[0]}</label>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="space-y-8">
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center">
                    <Layout className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">Navigation Components</h3>
                    <p className="text-sm text-secondary-600">Componentes para navegação e organização</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tabs */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Tabs (Demonstração Ativa)</h4>
                  <p className="text-sm text-secondary-600">Os tabs que você está vendo são um exemplo do componente em funcionamento.</p>
                </div>

                {/* Accordion */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Accordion</h4>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Seção 1</AccordionTrigger>
                      <AccordionContent>
                        Conteúdo da primeira seção do accordion.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Seção 2</AccordionTrigger>
                      <AccordionContent>
                        Conteúdo da segunda seção do accordion.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Pagination */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Pagination</h4>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={10}
                    onPageChange={setCurrentPage}
                    showPrevNext
                    showFirstLast
                  />
                </div>

                {/* Dropdown */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Dropdown</h4>
                  <Dropdown>
                    <DropdownTrigger asChild>
                      <Button variant="outline">Abrir Menu</Button>
                    </DropdownTrigger>
                    <DropdownContent>
                      <DropdownItem>Item 1</DropdownItem>
                      <DropdownItem>Item 2</DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem>Item 3</DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-8">
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">Feedback Components</h3>
                    <p className="text-sm text-secondary-600">Componentes para feedback e estados de loading</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Progress Indicators</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-secondary-600 mb-2 block">Progress Bar (75%)</label>
                      <Progress value={75} max={100} />
                    </div>
                    
                    <div>
                      <label className="text-sm text-secondary-600 mb-2 block">Circular Progress</label>
                      <div className="flex items-center gap-4">
                        <CircularProgress size="sm" />
                        <CircularProgress size="md" />
                        <CircularProgress size="lg" />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-secondary-600 mb-2 block">Step Progress</label>
                      <StepProgress
                        steps={[
                          { id: '1', title: 'Passo 1', status: 'completed' },
                          { id: '2', title: 'Passo 2', status: 'current' },
                          { id: '3', title: 'Passo 3', status: 'pending' },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Spinners */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Spinners</h4>
                  <div className="flex items-center gap-4">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                  </div>
                </div>

                {/* Modal & Toast */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Modal & Toast</h4>
                  <div className="flex gap-3">
                    <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
                    <Button onClick={() => setToastVisible(true)}>Mostrar Toast</Button>
                  </div>
                </div>

                {/* Tooltip */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Tooltip</h4>
                  <Tooltip content="Esta é uma dica útil">
                    <Button variant="outline">Hover para tooltip</Button>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-8">
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center">
                    <Layout className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">Data Components</h3>
                    <p className="text-sm text-secondary-600">Componentes para exibição e manipulação de dados</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* DataTable */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Data Table</h4>
                  <DataTable
                    data={sampleData}
                    columns={tableColumns}
                    searchable
                    sortable
                    selectable
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    pagination={{
                      pageSize: 10,
                      currentPage: 1,
                      totalItems: sampleData.length
                    }}
                  />
                </div>

                {/* Skeletons */}
                <div>
                  <h4 className="font-medium mb-3 text-secondary-800">Skeleton Loaders</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-secondary-600 mb-2 block">Text Skeleton</label>
                      <SkeletonText lines={3} />
                    </div>
                    
                    <div>
                      <label className="text-sm text-secondary-600 mb-2 block">Avatar Skeleton</label>
                      <SkeletonAvatar size="lg" />
                    </div>
                    
                    <div>
                      <label className="text-sm text-secondary-600 mb-2 block">Card Skeleton</label>
                      <SkeletonCard />
                    </div>
                    
                    <div>
                      <label className="text-sm text-secondary-600 mb-2 block">Table Skeleton</label>
                      <SkeletonTable rows={3} columns={4} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Modal de Exemplo</h3>
            <p className="text-secondary-600 mb-6">
              Este é um exemplo de modal funcionando. Você pode adicionar qualquer conteúdo aqui.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Toast */}
        {toastVisible && (
          <Toast
            variant="success"
            title="Sucesso!"
            description="Toast exibido com sucesso."
            onClose={() => setToastVisible(false)}
          />
        )}
      </div>
    </div>
  )
} 