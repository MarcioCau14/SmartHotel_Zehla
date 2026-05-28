import { describe, it, expect } from 'vitest'
import { ReservationStatus, canTransition, isActive, isFinal } from '../../../src/domain/reservation/ReservationStatus'

describe('ReservationStatus', () => {
  describe('canTransition', () => {
    it('PENDING -> CONFIRMED', () => {
      expect(canTransition(ReservationStatus.PENDING, ReservationStatus.CONFIRMED)).toBe(true)
    })
    it('PENDING -> CANCELLED', () => {
      expect(canTransition(ReservationStatus.PENDING, ReservationStatus.CANCELLED)).toBe(true)
    })
    it('PENDING -> CHECKED_IN (invalid)', () => {
      expect(canTransition(ReservationStatus.PENDING, ReservationStatus.CHECKED_IN)).toBe(false)
    })
    it('CONFIRMED -> CHECKED_IN', () => {
      expect(canTransition(ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN)).toBe(true)
    })
    it('CONFIRMED -> CANCELLED', () => {
      expect(canTransition(ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED)).toBe(true)
    })
    it('CHECKED_IN -> CHECKED_OUT', () => {
      expect(canTransition(ReservationStatus.CHECKED_IN, ReservationStatus.CHECKED_OUT)).toBe(true)
    })
    it('should not transition from cancelled', () => {
      expect(canTransition(ReservationStatus.CANCELLED, ReservationStatus.CONFIRMED)).toBe(false)
    })
    it('should not transition from checked_out', () => {
      expect(canTransition(ReservationStatus.CHECKED_OUT, ReservationStatus.CONFIRMED)).toBe(false)
    })
  })

  describe('isActive', () => {
    it('CONFIRMED is active', () => {
      expect(isActive(ReservationStatus.CONFIRMED)).toBe(true)
    })
    it('CHECKED_IN is active', () => {
      expect(isActive(ReservationStatus.CHECKED_IN)).toBe(true)
    })
    it('CANCELLED is not active', () => {
      expect(isActive(ReservationStatus.CANCELLED)).toBe(false)
    })
  })

  describe('isFinal', () => {
    it('CANCELLED is final', () => {
      expect(isFinal(ReservationStatus.CANCELLED)).toBe(true)
    })
    it('CHECKED_OUT is final', () => {
      expect(isFinal(ReservationStatus.CHECKED_OUT)).toBe(true)
    })
    it('CONFIRMED is not final', () => {
      expect(isFinal(ReservationStatus.CONFIRMED)).toBe(false)
    })
  })
})
