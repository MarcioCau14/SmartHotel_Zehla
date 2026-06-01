import { Result } from '../../shared/Result'

export class Capacity {
  private constructor(
    public readonly maxAdults: number,
    public readonly maxChildren: number
  ) {
    Object.freeze(this)
  }

  get maxTotal(): number {
    return this.maxAdults + this.maxChildren
  }

  static create(maxAdults: number, maxChildren: number = 0): Result<Capacity, string> {
    if (!Number.isInteger(maxAdults) || maxAdults < 1) {
      return Result.fail('Capacidade mínima é de 1 adulto')
    }
    if (!Number.isInteger(maxChildren) || maxChildren < 0) {
      return Result.fail('Número de crianças não pode ser negativo')
    }
    if (maxAdults > 20) {
      return Result.fail('Número de adultos excede o máximo permitido (20)')
    }
    if (maxChildren > 10) {
      return Result.fail('Número de crianças excede o máximo permitido (10)')
    }
    return Result.ok(new Capacity(maxAdults, maxChildren))
  }

  accommodates(adults: number, children: number = 0): boolean {
    return adults <= this.maxAdults && children <= this.maxChildren
  }

  toString(): string {
    if (this.maxChildren > 0) {
      return `${this.maxAdults} adultos + ${this.maxChildren} crianças`
    }
    return `${this.maxAdults} adultos`
  }

  toJSON() {
    return {
      maxAdults: this.maxAdults,
      maxChildren: this.maxChildren,
      maxTotal: this.maxTotal,
    }
  }
}
