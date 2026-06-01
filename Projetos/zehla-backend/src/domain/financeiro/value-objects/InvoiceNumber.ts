import { Result } from '../../shared/Result'

const INVOICE_NUMBER_REGEX = /^INV-\d{6}-\d{6}$/

export class InvoiceNumber {
  private constructor(public readonly value: string) {
    Object.freeze(this)
  }

  static create(value: string): Result<InvoiceNumber, string> {
    if (!value || !INVOICE_NUMBER_REGEX.test(value)) {
      return Result.fail('Invalid invoice number format. Expected INV-YYYYMM-NNNNNN')
    }
    return Result.ok(new InvoiceNumber(value))
  }

  static generate(month: number, year: number, sequential: number): Result<InvoiceNumber, string> {
    if (month < 1 || month > 12) {
      return Result.fail('Month must be between 1 and 12')
    }
    if (year < 2000 || year > 2100) {
      return Result.fail('Year must be between 2000 and 2100')
    }
    if (sequential < 1 || sequential > 999999) {
      return Result.fail('Sequential must be between 1 and 999999')
    }
    const value = `INV-${year}${String(month).padStart(2, '0')}-${String(sequential).padStart(6, '0')}`
    return Result.ok(new InvoiceNumber(value))
  }

  getMonth(): number {
    return parseInt(this.value.substring(8, 10), 10)
  }

  getYear(): number {
    return parseInt(this.value.substring(4, 8), 10)
  }

  getSequential(): number {
    return parseInt(this.value.substring(11), 10)
  }

  equals(other: InvoiceNumber): boolean {
    return this.value === other.value
  }
}
