import { Result } from '../../../shared/Result'

export class Documento {
  private constructor(public readonly valor: string, public readonly tipo: string) {
    Object.freeze(this)
  }

  static criar(documento: string, tipo: string = 'CPF'): Result<Documento, Error> {
    if (typeof documento !== 'string' || !documento.trim()) {
      return Result.fail(new Error('Document number is required'))
    }
    
    if (typeof tipo !== 'string' || !tipo.trim()) {
      return Result.fail(new Error('Document type is required'))
    }
    
    const doc = documento.trim().replace(/[^\d]/g, '') // Remove non-digits
    const tipoUpper = tipo.trim().toUpperCase()
    
    // Validação básica por tipo
    if (tipoUpper === 'CPF') {
      if (!this.validarCPF(doc)) {
        return Result.fail(new Error('Invalid CPF number'))
      }
    } else if (tipoUpper === 'CNPJ') {
      if (!this.validarCNPJ(doc)) {
        return Result.fail(new Error('Invalid CNPJ number'))
      }
    } else if (tipoUpper === 'PASSAPORTE') {
      if (doc.length < 6 || doc.length > 20) {
        return Result.fail(new Error('Invalid passport number'))
      }
    } else {
      // Para outros tipos, validação básica
      if (doc.length < 2 || doc.length > 20) {
        return Result.fail(new Error('Invalid document number'))
      }
    }
    
    return Result.ok(new Documento(doc, tipoUpper))
  }

  private static validarCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false
    }
    
    let soma = 0
    let resto
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
    }
    
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) {
      resto = 0
    }
    
    if (resto !== parseInt(cpf.substring(9, 10))) {
      return false
    }
    
    soma = 0
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
    }
    
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) {
      resto = 0
    }
    
    if (resto !== parseInt(cpf.substring(10, 11))) {
      return false
    }
    
    return true
  }

  private static validarCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
      return false
    }
    
    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho)
    let digitos = cnpj.substring(tamanho)
    let soma = 0
    let pos = tamanho - 7
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.substring(tamanho - i, tamanho - i + 1)) * pos--
      if (pos < 2) {
        pos = 9
      }
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== parseInt(digitos.substring(0, 1))) {
      return false
    }
    
    tamanho = tamanho + 1
    numeros = cnpj.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.substring(tamanho - i, tamanho - i + 1)) * pos--
      if (pos < 2) {
        pos = 9
      }
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== parseInt(digitos.substring(1, 2))) {
      return false
    }
    
    return true
  }
  
  get formato(): string {
    if (this.tipo === 'CPF') {
      return `${this.valor.substring(0, 3)}.${this.valor.substring(3, 6)}.${this.valor.substring(6, 9)}-${this.valor.substring(9, 11)}`
    } else if (this.tipo === 'CNPJ') {
      return `${this.valor.substring(0, 2)}.${this.valor.substring(2, 5)}.${this.valor.substring(5, 8)}/${this.valor.substring(8, 12)}-${this.valor.substring(12, 14)}`
    }
    return this.valor
  }
}