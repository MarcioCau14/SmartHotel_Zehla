import { Result } from '../../shared/Result'
import { Money } from '../value-objects/Money'

export interface ROICalculatorInput {
  totalRooms: number
  averageDailyRate: number
  occupancyRate: number
  monthlyStaffCost: number
  hourlyRate: number
  hoursSavedPerRoomPerMonth: number
}

export interface ROICalculationResult {
  monthlyStaffHoursSaved: number
  monthlyCostSavings: Money
  yearlyCostSavings: Money
  potentialRevenueIncrease: Money
  totalYearlyBenefit: Money
  estimatedMonthlyInvestment: Money
  yearlyROI: number
  paybackMonths: number
}

export class ROICalculator {
  private readonly DEFAULT_HOURS_SAVED_PER_ROOM = 2.5
  private readonly DEFAULT_HOURLY_RATE_BRL = 35
  private readonly MIN_WAGE_BRL = 1412
  private readonly SALARIO_MINIMO_HORA = this.MIN_WAGE_BRL / 220

  calculate(input: ROICalculatorInput): Result<ROICalculationResult, Error> {
    if (input.totalRooms <= 0) {
      return Result.fail(new Error('Número de quartos deve ser maior que zero'))
    }
    if (input.averageDailyRate < 0) {
      return Result.fail(new Error('Diária média não pode ser negativa'))
    }
    if (input.occupancyRate < 0 || input.occupancyRate > 100) {
      return Result.fail(new Error('Taxa de ocupação deve ser entre 0 e 100'))
    }
    if (input.monthlyStaffCost < 0) {
      return Result.fail(new Error('Custo mensal de funcionários não pode ser negativo'))
    }

    const hourlyRate = input.hourlyRate > 0
      ? input.hourlyRate
      : this.DEFAULT_HOURLY_RATE_BRL

    const hoursPerRoom = input.hoursSavedPerRoomPerMonth > 0
      ? input.hoursSavedPerRoomPerMonth
      : this.DEFAULT_HOURS_SAVED_PER_ROOM

    const monthlyHoursSaved = input.totalRooms * hoursPerRoom
    const monthlySavings = hourlyRate * monthlyHoursSaved

    const monthlyCostSavingsResult = Money.deReais(monthlySavings)
    if (monthlyCostSavingsResult.isFail) return Result.fail(monthlyCostSavingsResult.error)

    const yearlySavingsResult = monthlyCostSavingsResult.value.multiplicar(12)
    if (yearlySavingsResult.isFail) return Result.fail(yearlySavingsResult.error)

    const occupiedRoomsPerNight = input.totalRooms * (input.occupancyRate / 100)
    const nightlyRevenue = occupiedRoomsPerNight * input.averageDailyRate
    const monthlyRevenue = nightlyRevenue * 30
    const revenueBoost = monthlyRevenue * 0.15
    const potentialRevenueResult = Money.deReais(revenueBoost * 12)
    if (potentialRevenueResult.isFail) return Result.fail(potentialRevenueResult.error)

    const totalYearlyResult = yearlySavingsResult.value.add(potentialRevenueResult.value)
    if (totalYearlyResult.isFail) return Result.fail(totalYearlyResult.error)

    const estimatedInvestmentResult = Money.deReais(input.totalRooms * 97)
    if (estimatedInvestmentResult.isFail) return Result.fail(estimatedInvestmentResult.error)

    const yearlyROI = estimatedInvestmentResult.value.isZero()
      ? 0
      : Math.round((totalYearlyResult.value.centavos / estimatedInvestmentResult.value.centavos) * 100)

    const paybackMonths = totalYearlyResult.value.isZero()
      ? 0
      : Math.ceil((estimatedInvestmentResult.value.centavos / (totalYearlyResult.value.centavos / 12)))

    return Result.ok({
      monthlyStaffHoursSaved: Math.round(monthlyHoursSaved * 100) / 100,
      monthlyCostSavings: monthlyCostSavingsResult.value,
      yearlyCostSavings: yearlySavingsResult.value,
      potentialRevenueIncrease: potentialRevenueResult.value,
      totalYearlyBenefit: totalYearlyResult.value,
      estimatedMonthlyInvestment: estimatedInvestmentResult.value,
      yearlyROI,
      paybackMonths,
    })
  }
}
