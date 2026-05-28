import { Result } from '../../../domain/shared/Result'
import { Invoice } from '../../../domain/financeiro/entities/Invoice'
import { InvoiceItem } from '../../../domain/financeiro/entities/InvoiceItem'
import { InvoiceNumber } from '../../../domain/financeiro/value-objects/InvoiceNumber'
import { BillingPeriod } from '../../../domain/financeiro/value-objects/BillingPeriod'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { InvoiceItemType } from '../../../domain/financeiro/enums'
import { IInvoiceRepository } from '../ports/IInvoiceRepository'

export interface GerarFaturaInput {
  reservationId: string
  guestId: string
  propertyId: string
  startDate: Date
  endDate: Date
  items: {
    description: string
    type: InvoiceItemType
    unitPrice: number
    quantity: number
  }[]
}

export interface GerarFaturaOutput {
  id: string
  number: string
  totalAmount: number
  status: string
}

export class GerarFaturaUseCase {
  constructor(private invoiceRepo: IInvoiceRepository) {}

  async execute(input: GerarFaturaInput): Promise<Result<GerarFaturaOutput, string>> {
    const existing = await this.invoiceRepo.findByReservation(input.reservationId)
    if (existing) {
      return Result.fail('Reserva já possui fatura')
    }

    const billingResult = BillingPeriod.create(input.startDate, input.endDate)
    if (billingResult.isFail) return Result.fail(billingResult.error)
    const billing = billingResult.value

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const existingInvoices = await this.invoiceRepo.findByProperty(input.propertyId, { month, year })
    const nextSeq = existingInvoices.length + 1

    const numResult = InvoiceNumber.generate(month, year, nextSeq)
    if (numResult.isFail) return Result.fail(numResult.error)

    const id = crypto.randomUUID()
    const invoiceResult = Invoice.create({
      id,
      number: numResult.value,
      guestId: input.guestId,
      reservationId: input.reservationId,
      billingPeriod: billing,
    })
    if (invoiceResult.isFail) return Result.fail(invoiceResult.error)

    const invoice = invoiceResult.value

    for (const itemInput of input.items) {
      const priceResult = Money.create(itemInput.unitPrice)
      if (priceResult.isFail) return Result.fail(`Item "${itemInput.description}": ${priceResult.error}`)

      const itemResult = InvoiceItem.create({
        id: crypto.randomUUID(),
        description: itemInput.description,
        type: itemInput.type,
        unitPrice: priceResult.value,
        quantity: itemInput.quantity,
      })
      if (itemResult.isFail) return Result.fail(`Item "${itemInput.description}": ${itemResult.error}`)

      const addResult = invoice.addItem(itemResult.value)
      if (addResult.isFail) return Result.fail(addResult.error)
    }

    await this.invoiceRepo.save(invoice, input.propertyId)
    invoice.clearEvents()

    return Result.ok({
      id: invoice.id,
      number: invoice.number.value,
      totalAmount: invoice.totalAmount.toNumber(),
      status: invoice.status,
    })
  }
}
