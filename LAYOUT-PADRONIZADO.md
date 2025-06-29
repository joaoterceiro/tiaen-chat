# Sistema de Layout Padronizado - Tiaen Chat

## Visão Geral

Foi implementado um sistema de layout padronizado para manter consistência visual e estrutural em todas as páginas do projeto. O sistema é baseado em componentes reutilizáveis que facilitam a manutenção e garantem uma experiência uniforme.

## Componentes de Layout

### 1. PageContainer

Container principal que define a largura máxima, padding e background das páginas.

```tsx
<PageContainer 
  variant="default" // 'default' | 'centered' | 'full' | 'narrow'
  withPadding={true} // Adiciona padding vertical
  withBackground={true} // Adiciona fundo gradiente
  minHeight="auto" // 'screen' | 'auto' | 'content'
>
  {/* Conteúdo da página */}
</PageContainer>
```

**Variantes:**
- `default`: max-w-7xl (1280px) - Para páginas principais
- `centered`: max-w-4xl (896px) - Para conteúdo centralizado  
- `full`: w-full - Para páginas que ocupam toda a largura
- `narrow`: max-w-2xl (672px) - Para formulários e conteúdo estreito

### 2. PageHeader

Cabeçalho padronizado com título, descrição e ações opcionais.

```tsx
<PageHeader
  title="Título da Página"
  description="Descrição opcional da página"
  actions={<Button>Ação</Button>} // Ações opcionais
  centered={false} // Centralizar conteúdo
/>
```

### 3. PageContent

Container para o conteúdo principal com diferentes layouts de grid.

```tsx
<PageContent
  layout="single" // 'single' | 'grid' | 'sidebar' | 'split'
  spacing="lg" // 'sm' | 'md' | 'lg' | 'xl'
>
  {/* Conteúdo */}
</PageContent>
```

**Layouts:**
- `single`: Layout em coluna única com espaçamento vertical
- `grid`: Grid responsivo 1-4 colunas (1 mobile, 2 tablet, 3-4 desktop)
- `sidebar`: Grid com sidebar (1 mobile, 4 colunas desktop)
- `split`: Grid dividido ao meio (1 mobile, 2 desktop)

### 4. PageSection

Seções organizadas com título, descrição e diferentes estilos visuais.

```tsx
<PageSection
  title="Título da Seção"
  description="Descrição da seção"
  actions={<Button>Ação</Button>}
  variant="card" // 'default' | 'card' | 'bordered'
>
  {/* Conteúdo da seção */}
</PageSection>
```

**Variantes:**
- `default`: Sem estilo visual adicional
- `card`: Fundo branco, bordas arredondadas, sombra
- `bordered`: Apenas borda com padding

## Implementação nas Páginas

### Página Inicial (Home)

```tsx
<PageContainer variant="centered" minHeight="screen" withPadding={false}>
  <div className="flex min-h-screen flex-col items-center justify-center py-24">
    {/* Conteúdo hero centralizado */}
  </div>
</PageContainer>
```

### Página de Componentes

```tsx
<PageContainer variant="default" withBackground={false}>
  <Breadcrumb className="mb-8">
    {/* Breadcrumb navigation */}
  </Breadcrumb>
  
  <PageHeader
    title="Design System Components"
    description="Complete collection of components..."
    centered
  />
  
  <PageContent layout="single" spacing="xl">
    {/* Tabs com componentes */}
    <PageSection title="Core Components" variant="card">
      {/* Conteúdo da seção */}
    </PageSection>
  </PageContent>
</PageContainer>
```

### Dashboard

```tsx
<PageContainer variant="default" withBackground={false}>
  <PageHeader
    title="Bem-vindo ao Dashboard! 👋"
    description={`Você está logado como: ${email}`}
  />
  
  <PageContent layout="grid" spacing="lg">
    {/* Cards do dashboard em grid */}
  </PageContent>
  
  <PageSection title="Ações Rápidas" variant="card">
    {/* Botões de ação */}
  </PageSection>
</PageContainer>
```

### Login

```tsx
<PageContainer variant="narrow" minHeight="screen" className="flex items-center justify-center">
  <div className="w-full max-w-md">
    {/* Formulário de login */}
  </div>
</PageContainer>
```

## Benefícios

### 1. Consistência Visual
- Larguras padronizadas em todas as páginas
- Espaçamentos uniformes
- Hierarquia visual clara

### 2. Responsividade
- Breakpoints consistentes
- Comportamento mobile-first
- Adaptação automática para diferentes telas

### 3. Manutenibilidade
- Componentes reutilizáveis
- Mudanças centralizadas
- Código mais limpo e organizado

### 4. Developer Experience
- IntelliSense completo
- Props tipadas com TypeScript
- Documentação integrada

### 5. Performance
- Componentes otimizados
- CSS-in-JS eficiente
- Bundle size otimizado

## Configurações de Grid

### Breakpoints Tailwind

```css
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

### Container Sizes

```css
default: max-w-7xl (1280px)
centered: max-w-4xl (896px) 
narrow: max-w-2xl (672px)
full: w-full (100%)
```

### Grid Layouts

```css
grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
sidebar: grid-cols-1 lg:grid-cols-4
split: grid-cols-1 lg:grid-cols-2
```

### Spacing Scale

```css
sm: gap-4 / space-y-4   (16px)
md: gap-6 / space-y-6   (24px)
lg: gap-8 / space-y-8   (32px)
xl: gap-12 / space-y-12 (48px)
```

## Próximas Melhorias

1. **Animações de Transição**
   - Fade in/out entre páginas
   - Animações de grid

2. **Temas Dinâmicos**
   - Suporte a modo escuro
   - Customização de cores

3. **Layouts Avançados**
   - Masonry grid
   - Sticky sidebar
   - Infinite scroll

4. **Acessibilidade**
   - Skip links
   - Focus management
   - Screen reader optimization

## Status

✅ **Implementado e Funcional**
- Todos os componentes de layout criados
- Páginas principais atualizadas
- Build bem-sucedido
- TypeScript 100% tipado
- Responsividade testada

O sistema de layout padronizado está pronto para produção e pode ser usado como base para todas as futuras páginas do projeto. 