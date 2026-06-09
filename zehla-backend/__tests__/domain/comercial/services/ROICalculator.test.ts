import { describe, it, expect } from 'vitest'
import { ROICalculator } from '../../../../src/domain/comercial/services/ROICalculator'

describe('ROICalculator', () => {
  const calculator = new ROICalculator()

  const validInput = {
    totalRooms: 10,
    averageDailyRate: 250,
    occupancyRate: 70,
    monthlyStaffCost: 5000,
    hourlyRate: 35,
    hoursSavedPerRoomPerMonth: 2.5,
  }

  it('should calculate ROI for small pousada', () => {
    const result = calculator.calculate(validInput)
    expect(result.isOk).toBe(true)
    const data = result.value
    expect(data.monthlyStaffHoursSaved).toBe(25)
    expect(data.monthlyCostSavings.valor).toBe(875)
    expect(data.yearlyCostSavings.valor).toBe(10500)
    expect(data.paybackMonths).toBeGreaterThan(0)
  })

  it('should calculate ROI for medium hotel', () => {
    const result = calculator.calculate({ ...validInput, totalRooms: 30 })
    expect(result.isOk).toBe(true)
    const data = result.value
    expect(data.monthlyStaffHoursSaved).toBe(75)
    expect(data.monthlyCostSavings.valor).toBe(2625)
  })

  it('should calculate ROI for large resort', () => {
    const result = calculator.calculate({ ...validInput, totalRooms: 100 })
    expect(result.isOk).toBe(true)
    const data = result.value
    expect(data.monthlyStaffHoursSaved).toBe(250)
    expect(data.yearlyCostSavings.valor).toBe(105000)
  })

  it('should fail with zero rooms', () => {
    const result = calculator.calculate({ ...validInput, totalRooms: 0 })
    expect(result.isFail).toBe(true)
  })

  it('should fail with negative occupancy', () => {
    const result = calculator.calculate({ ...validInput, occupancyRate: -1 })
    expect(result.isFail).toBe(true)
  })

  it('should fail with occupancy above 100', () => {
    const result = calculator.calculate({ ...validInput, occupancyRate: 101 })
    expect(result.isFail).toBe(true)
  })

  it('should handle zero occupancy gracefully', () => {
    const result = calculator.calculate({ ...validInput, occupancyRate: 0 })
    expect(result.isOk).toBe(true)
    expect(result.value.potentialRevenueIncrease.valor).toBe(0)
  })

  it('should use default hourly rate when not provided', () => {
    const result = calculator.calculate({ ...validInput, hourlyRate: 0 })
    expect(result.isOk).toBe(true)
    expect(result.value.monthlyCostSavings.valor).toBe(875)
  })

  it('should use custom hourly rate', () => {
    const result = calculator.calculate({ ...validInput, hourlyRate: 50 })
    expect(result.isOk).toBe(true)
    expect(result.value.monthlyCostSavings.valor).toBe(1250)
  })

  it('should have positive yearly ROI', () => {
    const result = calculator.calculate(validInput)
    expect(result.isOk).toBe(true)
    expect(result.value.yearlyROI).toBeGreaterThan(0)
    expect(result.value.paybackMonths).toBeGreaterThan(0)
    expect(result.value.paybackMonths).toBeLessThan(24)
  })
})
