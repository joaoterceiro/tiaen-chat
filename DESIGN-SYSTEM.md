# Design System - Tiaen Chat

Este documento descreve o design system completo utilizado no projeto Tiaen Chat, incluindo cores, tipografia, componentes e diretrizes de uso.

## 🎨 Paleta de Cores

### Cor Primária (#FF6A00)
Nossa cor primária é um laranja vibrante que transmite energia, criatividade e modernidade.

```css
primary: {
  50: '#FFF4ED',   // Muito claro
  100: '#FFE6D5',  // Claro
  200: '#FFCCAA',  // Claro médio
  300: '#FFA574',  // Médio claro
  400: '#FF7A3C',  // Médio
  500: '#FF6A00',  // Principal ⭐
  600: '#E55100',  // Médio escuro
  700: '#BF360C',  // Escuro
  800: '#A0290A',  // Muito escuro
  900: '#7D1F08',  // Mais escuro
  950: '#4A0E03',  // Extremamente escuro
}
```

### Cores Secundárias (Cinzas)
Utilizadas para textos, bordas e elementos de interface.

```css
secondary: {
  50: '#F8FAFC',   // Background claro
  100: '#F1F5F9',  // Background médio
  200: '#E2E8F0',  // Bordas claras
  300: '#CBD5E1',  // Bordas
  400: '#94A3B8',  // Texto secundário
  500: '#64748B',  // Texto principal
  600: '#475569',  // Texto escuro
  700: '#334155',  // Texto muito escuro
  800: '#1E293B',  // Backgrounds escuros
  900: '#0F172A',  // Texto principal escuro
  950: '#020617',  // Extremamente escuro
}
```

### Cores de Estado

#### Sucesso (Verde)
```css
success: {
  500: '#22C55E', // Principal
  // ... outras variações
}
```

#### Erro (Vermelho)
```css
error: {
  500: '#EF4444', // Principal
  // ... outras variações
}
```

#### Aviso (Amarelo)
```css
warning: {
  500: '#F59E0B', // Principal
  // ... outras variações
}
```

## 📝 Tipografia

### Fontes
- **Principal**: Inter (sans-serif)
- **Monospace**: JetBrains Mono

### Escalas de Tamanho
```css
xs: 0.75rem (12px)
sm: 0.875rem (14px)
base: 1rem (16px)
lg: 1.125rem (18px)
xl: 1.25rem (20px)
2xl: 1.5rem (24px)
3xl: 1.875rem (30px)
4xl: 2.25rem (36px)
5xl: 3rem (48px)
6xl: 3.75rem (60px)
```

### Hierarquia de Títulos
- **H1**: text-4xl md:text-5xl lg:text-6xl
- **H2**: text-3xl md:text-4xl lg:text-5xl
- **H3**: text-2xl md:text-3xl lg:text-4xl
- **H4**: text-xl md:text-2xl lg:text-3xl
- **H5**: text-lg md:text-xl lg:text-2xl
- **H6**: text-base md:text-lg lg:text-xl

## 🧩 Componentes

### Button
Componente de botão com múltiplas variações e estados.

#### Variações
- **primary**: Botão principal com cor primária
- **secondary**: Botão secundário com fundo claro
- **outline**: Botão com borda e fundo transparente
- **ghost**: Botão transparente
- **destructive**: Botão para ações perigosas

#### Tamanhos
- **sm**: Pequeno (h-8)
- **md**: Médio (h-10) - padrão
- **lg**: Grande (h-12)
- **xl**: Extra grande (h-14)

#### Exemplo de Uso
```tsx
import { Button } from '@/components/ui'

// Botão primário básico
<Button>Clique aqui</Button>

// Botão com link
<Button asChild variant="outline" size="lg">
  <Link href="/dashboard">Dashboard</Link>
</Button>

// Botão com loading
<Button loading={isLoading}>
  Salvando...
</Button>
```

### Card
Componente container com sombra e bordas arredondadas.

#### Variações
- **default**: Card padrão com sombra sutil
- **elevated**: Card com sombra mais pronunciada
- **outlined**: Card com borda destacada

#### Sub-componentes
- **CardHeader**: Cabeçalho do card
- **CardTitle**: Título principal
- **CardDescription**: Descrição secundária
- **CardContent**: Conteúdo principal
- **CardFooter**: Rodapé do card

#### Exemplo de Uso
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>
      Descrição opcional do conteúdo
    </CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo principal aqui
  </CardContent>
</Card>
```

### Alert
Componente para exibir mensagens de feedback.

#### Variações
- **info**: Informação (cor primária)
- **success**: Sucesso (verde)
- **warning**: Aviso (amarelo)
- **error**: Erro (vermelho)

#### Exemplo de Uso
```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui'

<Alert variant="success">
  <AlertTitle>Sucesso!</AlertTitle>
  <AlertDescription>
    Operação realizada com êxito.
  </AlertDescription>
</Alert>
```

### Spinner
Componente de loading animado.

#### Tamanhos
- **sm**: 16px
- **md**: 24px
- **lg**: 32px
- **xl**: 48px

#### Cores
- **primary**: Cor primária
- **secondary**: Cor secundária
- **white**: Branco

#### Exemplo de Uso
```tsx
import { Spinner } from '@/components/ui'

<Spinner size="lg" color="primary" />
```

## 🎯 Espaçamento

### Escala de Espaçamento
Utilizamos a escala padrão do Tailwind CSS com algumas adições:

```css
4: 1rem (16px)
6: 1.5rem (24px)
8: 2rem (32px)
12: 3rem (48px)
16: 4rem (64px)
18: 4.5rem (72px) // Customizado
20: 5rem (80px)
24: 6rem (96px)
```

## 📐 Border Radius

```css
sm: 0.125rem (2px)
DEFAULT: 0.25rem (4px)
md: 0.375rem (6px)
lg: 0.5rem (8px)
xl: 0.75rem (12px)
2xl: 1rem (16px)
3xl: 1.5rem (24px)
```

## 🌑 Sombras

### Sombras Padrão
```css
sm: Sombra sutil
DEFAULT: Sombra padrão
md: Sombra média
lg: Sombra grande
xl: Sombra extra grande
2xl: Sombra muito grande
```

### Sombra Customizada
```css
shadow-primary: Sombra com cor primária
```

## 🎨 Classes Utilitárias

### Gradientes
```css
.gradient-primary: Gradiente da cor primária
.text-gradient-primary: Texto com gradiente primário
.bg-gradient-primary: Background com gradiente primário
```

### Exemplo de Uso
```tsx
<div className="gradient-primary p-6 rounded-xl">
  <h2 className="text-gradient-primary">
    Título com gradiente
  </h2>
</div>
```

## 📱 Responsividade

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Diretrizes
- Design mobile-first
- Componentes responsivos por padrão
- Testes em múltiplos dispositivos
- Touch targets mínimos de 44px

## ♿ Acessibilidade

### Contraste
- Seguimos as diretrizes WCAG 2.1 AA
- Contraste mínimo de 4.5:1 para texto normal
- Contraste mínimo de 3:1 para texto grande

### Navegação
- Suporte completo a teclado
- Estados de foco visíveis
- ARIA labels apropriados
- Estrutura semântica

## 🚀 Como Usar

### Importação
```tsx
// Importar componentes individuais
import { Button, Card, Alert } from '@/components/ui'

// Ou importar todos
import * as UI from '@/components/ui'
```

### Customização
Para customizar um componente, use a prop `className`:

```tsx
<Button className="bg-purple-500 hover:bg-purple-600">
  Botão customizado
</Button>
```

### Extensão
Para criar novos componentes baseados no design system:

```tsx
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui'

interface CustomButtonProps extends ButtonProps {
  icon?: React.ReactNode
}

export function CustomButton({ icon, children, className, ...props }: CustomButtonProps) {
  return (
    <Button className={cn('flex items-center gap-2', className)} {...props}>
      {icon}
      {children}
    </Button>
  )
}
```

## 📋 Checklist de Implementação

### ✅ Implementado
- [x] Paleta de cores completa
- [x] Componente Button
- [x] Componente Card
- [x] Componente Alert
- [x] Componente Spinner
- [x] Componente Input
- [x] Componente Textarea
- [x] Componente Badge
- [x] Componente Avatar (com AvatarGroup)
- [x] Componente Modal/Dialog
- [x] Componente Dropdown
- [x] Componente Toast (Notificações)
- [x] Tipografia responsiva
- [x] Classes utilitárias
- [x] Animações e transições
- [x] Aplicação nas páginas principais
- [x] Página de demonstração dos componentes

### 🔄 Próximos Passos
- [ ] Componente Navigation/Navbar
- [ ] Componente Tabs
- [ ] Componente Accordion
- [ ] Componente Progress Bar
- [ ] Componente Switch/Toggle
- [ ] Componente Checkbox/Radio
- [ ] Componente Select
- [ ] Temas escuro/claro
- [ ] Componente Tooltip
- [ ] Componente Breadcrumb

## 🤝 Contribuição

Para contribuir com o design system:

1. Siga as diretrizes estabelecidas
2. Mantenha consistência visual
3. Teste acessibilidade
4. Documente novos componentes
5. Inclua exemplos de uso

## 📚 Novos Componentes Implementados

### Input
Componente de entrada de texto com suporte a labels, ícones e validação.

```tsx
import { Input } from '@/components/ui'

<Input 
  label="Nome" 
  placeholder="Digite seu nome"
  error={hasError}
  helperText="Este campo é obrigatório"
  startIcon={<SearchIcon />}
/>
```

### Textarea
Área de texto redimensionável para entradas maiores.

```tsx
import { Textarea } from '@/components/ui'

<Textarea 
  label="Mensagem"
  placeholder="Digite sua mensagem..."
  resize="vertical"
/>
```

### Badge
Componente para exibir status, categorias ou contadores.

```tsx
import { Badge } from '@/components/ui'

<Badge variant="success">Ativo</Badge>
<Badge dot variant="error" />
```

### Avatar
Componente para exibir fotos de perfil com fallbacks e status.

```tsx
import { Avatar, AvatarGroup } from '@/components/ui'

<Avatar src="/user.jpg" fallback="JD" status="online" />

<AvatarGroup max={3}>
  <Avatar fallback="JD" />
  <Avatar fallback="AM" />
  <Avatar fallback="RK" />
</AvatarGroup>
```

### Modal
Modal responsivo com gerenciamento de foco e acessibilidade.

```tsx
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '@/components/ui'

<Modal open={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Confirmar ação</ModalTitle>
  </ModalHeader>
  <ModalContent>
    Tem certeza que deseja continuar?
  </ModalContent>
  <ModalFooter>
    <Button onClick={handleClose}>Confirmar</Button>
  </ModalFooter>
</Modal>
```

### Dropdown
Menu dropdown com suporte a separadores e labels.

```tsx
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui'

<Dropdown trigger={<Button>Menu</Button>}>
  <DropdownItem>Editar</DropdownItem>
  <DropdownSeparator />
  <DropdownItem destructive>Excluir</DropdownItem>
</Dropdown>
```

### Toast
Notificações temporárias para feedback do usuário.

```tsx
import { Toast, ToastContainer } from '@/components/ui'

<ToastContainer>
  <Toast 
    variant="success"
    title="Sucesso!"
    description="Operação realizada com êxito"
    onClose={handleClose}
  />
</ToastContainer>
```

## 🎨 Página de Demonstração

Acesse `/components` para ver todos os componentes em ação com exemplos interativos.

## 📚 Recursos

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design System Handbook](https://www.designbetter.co/design-systems-handbook) 