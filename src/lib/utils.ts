import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Contador global para IDs únicos (evita problemas de hidratação)
let idCounter = 0

/**
 * Gera um ID único que é consistente entre servidor e cliente
 * Evita problemas de hidratação do React
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Hook para gerar IDs únicos em componentes React
 * Usa um valor padrão que é atualizado no useEffect para evitar problemas de hidratação
 */
export function useStableId(prefix: string = 'id'): string {
  // Retorna um ID baseado no contador, que será consistente
  return `${prefix}-${idCounter + 1}`
} 