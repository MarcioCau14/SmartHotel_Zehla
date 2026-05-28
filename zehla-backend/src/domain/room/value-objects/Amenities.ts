import { Result } from '../../shared/Result'

const MAX_AMENITIES = 20
const MIN_AMENITY_LENGTH = 2
const MAX_AMENITY_LENGTH = 50

export class Amenities {
  private constructor(public readonly items: readonly string[]) {
    Object.freeze(this)
  }

  static create(items: string[]): Result<Amenities, string> {
    if (!Array.isArray(items)) {
      return Result.fail('Amenities deve ser um array')
    }
    if (items.length > MAX_AMENITIES) {
      return Result.fail(`Máximo de ${MAX_AMENITIES} amenities por quarto`)
    }

    const normalized = items.map((a) => a.trim().toLowerCase()).filter(Boolean)

    for (const amenity of normalized) {
      if (amenity.length < MIN_AMENITY_LENGTH) {
        return Result.fail(`Amenity inválida: "${amenity}" — mínimo ${MIN_AMENITY_LENGTH} caracteres`)
      }
      if (amenity.length > MAX_AMENITY_LENGTH) {
        return Result.fail(`Amenity inválida: "${amenity}" — máximo ${MAX_AMENITY_LENGTH} caracteres`)
      }
    }

    const unique = [...new Set(normalized)]
    if (unique.length !== normalized.length) {
      return Result.fail('Amenities duplicadas não são permitidas')
    }

    return Result.ok(new Amenities(unique))
  }

  static EMPTY = new Amenities([])

  has(amenity: string): boolean {
    return this.items.includes(amenity.trim().toLowerCase())
  }

  add(amenity: string): Result<Amenities, string> {
    return Amenities.create([...this.items, amenity])
  }

  remove(amenity: string): Amenities {
    const normalized = amenity.trim().toLowerCase()
    return new Amenities(this.items.filter((a) => a !== normalized))
  }

  count(): number {
    return this.items.length
  }

  toJSON(): string[] {
    return [...this.items]
  }
}
