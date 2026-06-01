import { Result } from '../../shared/Result'

export enum PixKeyType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  RANDOM = 'RANDOM',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PHONE_REGEX = /^\+55\d{10,11}$/

function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  return remainder === parseInt(cpf[10])
}

function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false
  let size = 12
  let sum = 0
  const firstMultipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (let i = 0; i < size; i++) sum += parseInt(cnpj[i]) * firstMultipliers[i]
  let remainder = sum % 11
  if (remainder < 2) remainder = 0
  else remainder = 11 - remainder
  if (remainder !== parseInt(cnpj[12])) return false
  size = 13
  sum = 0
  const secondMultipliers = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (let i = 0; i < size; i++) sum += parseInt(cnpj[i]) * secondMultipliers[i]
  remainder = sum % 11
  if (remainder < 2) remainder = 0
  else remainder = 11 - remainder
  return remainder === parseInt(cnpj[13])
}

function stripPunctuation(value: string): string {
  return value.replace(/[^0-9]/g, '')
}

function stripPhonePunctuation(value: string): string {
  return value.replace(/[^0-9+]/g, '')
}

export class PixKey {
  private constructor(
    public readonly type: PixKeyType,
    public readonly value: string
  ) {
    Object.freeze(this)
  }

  static create(type: PixKeyType, value: string): Result<PixKey, string> {
    if (!value || value.trim().length === 0) {
      return Result.fail('Pix key value is required')
    }

    let normalized: string
    switch (type) {
      case PixKeyType.CPF:
      case PixKeyType.CNPJ:
        normalized = stripPunctuation(value.trim())
        break
      case PixKeyType.RANDOM:
        normalized = value.trim().toLowerCase()
        break
      case PixKeyType.EMAIL:
        normalized = value.trim().toLowerCase()
        break
      case PixKeyType.PHONE:
        normalized = stripPhonePunctuation(value.trim())
        break
      default:
        normalized = value.trim()
    }

    switch (type) {
      case PixKeyType.CPF: {
        if (!/^\d{11}$/.test(normalized)) {
          return Result.fail('CPF must have exactly 11 digits')
        }
        if (!isValidCPF(normalized)) {
          return Result.fail('Invalid CPF check digits')
        }
        return Result.ok(new PixKey(type, normalized))
      }
      case PixKeyType.CNPJ: {
        if (!/^\d{14}$/.test(normalized)) {
          return Result.fail('CNPJ must have exactly 14 digits')
        }
        if (!isValidCNPJ(normalized)) {
          return Result.fail('Invalid CNPJ check digits')
        }
        return Result.ok(new PixKey(type, normalized))
      }
      case PixKeyType.EMAIL: {
        if (!EMAIL_REGEX.test(normalized)) {
          return Result.fail('Invalid email format')
        }
        return Result.ok(new PixKey(type, normalized))
      }
      case PixKeyType.PHONE: {
        if (!PHONE_REGEX.test(normalized)) {
          return Result.fail('Phone must follow format +55XXXXXXXXXXX (11-12 digits)')
        }
        return Result.ok(new PixKey(type, normalized))
      }
      case PixKeyType.RANDOM: {
        if (!UUID_REGEX.test(normalized)) {
          return Result.fail('Random key must be a valid UUID v4')
        }
        return Result.ok(new PixKey(type, normalized.toLowerCase()))
      }
      default:
        return Result.fail('Invalid Pix key type')
    }
  }
}
