import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

interface ErrorMapping {
  code: string;
  message: string;
}

const ERROR_MAPPINGS: ErrorMapping[] = [
  { code: 'SUPABASE_AUTH', message: '🔑 Erro de autenticação. Por favor, faça login novamente.' },
  { code: 'SUPABASE_CONNECTION', message: '🔌 Erro de conexão com Supabase. Verifique sua conexão.' },
  { code: 'OPENAI_API', message: '🤖 Erro no serviço OpenAI. Verifique sua chave API.' },
  { code: 'EVOLUTION_API', message: '📱 Erro no serviço Evolution. Verifique a conexão.' },
  { code: 'NETWORK', message: '🌐 Erro de rede. Verifique sua conexão com a internet.' },
  { code: 'VALIDATION', message: '⚠️ Erro de validação. Verifique os dados informados.' },
  { code: 'PERMISSION', message: '🚫 Permissão negada. Você não tem acesso a este recurso.' },
];

export function handleError(error: any, defaultMessage = 'Ocorreu um erro inesperado'): string {
  console.error('Error details:', error);

  // If it's our custom AppError, use its message directly
  if (isAppError(error)) {
    const message = error.message;
    toast.error(message);
    return message;
  }

  // Check for known error patterns
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      const message = '🔌 Erro de conexão. Verifique sua internet.';
      toast.error(message);
      return message;
    }

    // Authentication errors
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      const message = '🔑 Erro de autenticação. Faça login novamente.';
      toast.error(message);
      return message;
    }

    // API key errors
    if (error.message.includes('API key')) {
      const message = '🔑 Chave API inválida. Verifique suas configurações.';
      toast.error(message);
      return message;
    }
  }

  // Handle error responses from APIs
  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 401:
        const authError = '🔑 Sessão expirada. Por favor, faça login novamente.';
        toast.error(authError);
        return authError;
      case 403:
        const forbiddenError = '🚫 Acesso negado. Você não tem permissão.';
        toast.error(forbiddenError);
        return forbiddenError;
      case 404:
        const notFoundError = '❌ Recurso não encontrado.';
        toast.error(notFoundError);
        return notFoundError;
      case 429:
        const rateLimitError = '⚠️ Muitas requisições. Aguarde um momento.';
        toast.error(rateLimitError);
        return rateLimitError;
    }
  }

  // Default error handling
  toast.error(defaultMessage);
  return defaultMessage;
}

export function createErrorMessage(code: string, details?: string): string {
  const mapping = ERROR_MAPPINGS.find(m => m.code === code);
  if (mapping) {
    return details ? `${mapping.message} - ${details}` : mapping.message;
  }
  return 'Ocorreu um erro inesperado';
}

export function throwAppError(code: string, details?: string): never {
  throw new AppError(createErrorMessage(code, details), code, details);
} 