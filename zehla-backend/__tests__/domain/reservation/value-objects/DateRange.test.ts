import { describe, it, expect } from 'vitest'
import { DateRange } from '../../../../src/domain/reservation/value-objects/DateRange'

describe('DateRange', () => {
  it('should create a valid DateRange', () => {
    const result = DateRange.createFromStrings('2027-06-01', '2027-06-05')
    expect(result.isOk).toBe(true)
    expect(result.value.nights).toBe(4)
  })

  it('should fail when checkOut <= checkIn', () => {
    const result = DateRange.createFromStrings('2027-06-05', '2027-06-05')
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('posterior')
  })

  it('should fail when checkIn is in the past', () => {
    const result = DateRange.createFromStrings('2020-01-01', '2020-01-05')
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('passado')
  })

  it('should fail with invalid date strings', () => {
    const result = DateRange.createFromStrings('invalid', '2027-06-05')
    expect(result.isFail).toBe(true)
  })

  it('should detect overlapping ranges', () => {
    const a = DateRange.createFromStrings('2027-06-01', '2027-06-10')
    const b = DateRange.createFromStrings('2027-06-05', '2027-06-15')
    expect(a.isOk && b.isOk).toBe(true)
    expect(a.value!.overlaps(b.value!)).toBe(true)
  })

  it('should detect non-overlapping ranges', () => {
    const a = DateRange.createFromStrings('2027-06-01', '2027-06-05')
    const b = DateRange.createFromStrings('2027-06-10', '2027-06-15')
    expect(a.isOk && b.isOk).toBe(true)
    expect(a.value!.overlaps(b.value!)).toBe(false)
  })

  it('should detect containing dates', () => {
    const range = DateRange.createFromStrings('2027-06-01', '2027-06-10')
    expect(range.isOk).toBe(true)
    const mid = new Date('2027-06-05')
    expect(range.value!.contains(mid)).toBe(true)
    const before = new Date('2027-05-31')
    expect(range.value!.contains(before)).toBe(false)
  })
})
