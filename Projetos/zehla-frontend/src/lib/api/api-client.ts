import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { Result } from '@/types/result'

// Token persistido em localStorage (nao session storage - persiste entre abas/fechamentos)
// TODO(seguranca): migrar para httpOnly cookies via next-auth session strategy (protecao XSS)
const AUTH_TOKEN_KEY = 'zcc_token'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  window.location.href = '/zcc-login'
}

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearSession()
      return Promise.reject(error)
    }
    return Promise.reject(error)
  },
)

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') return 'Tempo limite excedido. Tente novamente.'
    if (!error.response) return 'Erro de rede. Verifique sua conexão.'
    const serverMsg = error.response.data?.error
    if (serverMsg) return serverMsg
    const statusMessages: Record<number, string> = {
      400: 'Dados inválidos.',
      404: 'Recurso não encontrado.',
      409: 'Conflito ao processar requisição.',
      422: 'Dados não processáveis.',
      429: 'Muitas requisições. Aguarde um momento.',
      500: 'Erro interno do servidor.',
      502: 'Serviço temporariamente indisponível.',
      503: 'Serviço em manutenção.',
    }
    return statusMessages[error.response.status] ?? `Erro inesperado (${error.response.status}).`
  }
  if (error instanceof Error) return error.message
  return 'Erro desconhecido.'
}

export async function apiGet<T>(path: string, config?: AxiosRequestConfig): Promise<Result<T, Error>> {
  try {
    const { data } = await api.get<T>(path, config)
    return Result.ok(data)
  } catch (err) {
    return Result.fail(new Error(extractErrorMessage(err)))
  }
}

export async function apiPost<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<Result<T, Error>> {
  try {
    const { data } = await api.post<T>(path, body, config)
    return Result.ok(data)
  } catch (err) {
    return Result.fail(new Error(extractErrorMessage(err)))
  }
}

export async function apiPatch<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<Result<T, Error>> {
  try {
    const { data } = await api.patch<T>(path, body, config)
    return Result.ok(data)
  } catch (err) {
    return Result.fail(new Error(extractErrorMessage(err)))
  }
}

export async function apiDelete<T>(path: string, config?: AxiosRequestConfig): Promise<Result<T, Error>> {
  try {
    const { data } = await api.delete<T>(path, config)
    return Result.ok(data)
  } catch (err) {
    return Result.fail(new Error(extractErrorMessage(err)))
  }
}

export { api }
