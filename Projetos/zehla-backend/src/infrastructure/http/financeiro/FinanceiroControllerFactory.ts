import { getRepoPrisma } from '../../../lib/prisma'
import { PrismaInvoiceRepository } from '../../persistence/financeiro/PrismaInvoiceRepository'
import { PrismaPaymentRepository } from '../../persistence/financeiro/PrismaPaymentRepository'
import { PrismaPixTransactionRepository } from '../../persistence/financeiro/PrismaPixTransactionRepository'
import { PrismaFinancialAuditRepository } from '../../persistence/financeiro/PrismaFinancialAuditRepository'
import { FakePixGateway } from '../../persistence/financeiro/FakePixGateway'
import { FakeGatewayTransaction } from '../../persistence/financeiro/FakeGatewayTransaction'
import { InvoiceCalculationService } from '../../../domain/financeiro/services/InvoiceCalculationService'
import { PixQrCodeGenerationService } from '../../../application/financeiro/services/PixQrCodeGenerationService'
import { GerarFaturaUseCase } from '../../../application/financeiro/use-cases/GerarFaturaUseCase'
import { EmitirFaturaUseCase } from '../../../application/financeiro/use-cases/EmitirFaturaUseCase'
import { CancelarFaturaUseCase } from '../../../application/financeiro/use-cases/CancelarFaturaUseCase'
import { ProcessarPagamentoPixUseCase } from '../../../application/financeiro/use-cases/ProcessarPagamentoPixUseCase'
import { ProcessarEstornoUseCase } from '../../../application/financeiro/use-cases/ProcessarEstornoUseCase'
import { ConciliarTransacaoPixUseCase } from '../../../application/financeiro/use-cases/ConciliarTransacaoPixUseCase'
import { ListarFaturamentoUseCase } from '../../../application/financeiro/use-cases/ListarFaturamentoUseCase'
import { MarcarFaturaVencidaUseCase } from '../../../application/financeiro/use-cases/MarcarFaturaVencidaUseCase'
import type { IInvoiceRepository } from '../../../application/financeiro/ports/IInvoiceRepository'
import type { IPaymentRepository } from '../../../application/financeiro/ports/IPaymentRepository'
import type { IPixTransactionRepository } from '../../../application/financeiro/ports/IPixTransactionRepository'
import type { IFinancialAuditRepository } from '../../../application/financeiro/ports/IFinancialAuditRepository'
import type { IPixGatewayPort } from '../../../application/financeiro/ports/IPixGatewayPort'

export class FinanceiroControllerFactory {
  private static db = getRepoPrisma()
  private static invoiceRepo: IInvoiceRepository = new PrismaInvoiceRepository(FinanceiroControllerFactory.db)
  private static paymentRepo: IPaymentRepository = new PrismaPaymentRepository(FinanceiroControllerFactory.db)
  private static pixTxRepo: IPixTransactionRepository = new PrismaPixTransactionRepository(FinanceiroControllerFactory.db)
  private static auditRepo: IFinancialAuditRepository = new PrismaFinancialAuditRepository(FinanceiroControllerFactory.db)
  private static pixGateway: IPixGatewayPort = new FakePixGateway()
  private static gatewayTxn = new FakeGatewayTransaction()
  private static calculationService = new InvoiceCalculationService()
  private static pixQrCodeService = new PixQrCodeGenerationService(FinanceiroControllerFactory.pixGateway)

  static configure(deps: {
    invoiceRepo?: IInvoiceRepository
    paymentRepo?: IPaymentRepository
    pixTxRepo?: IPixTransactionRepository
    auditRepo?: IFinancialAuditRepository
    pixGateway?: IPixGatewayPort
  }): void {
    if (deps.invoiceRepo) FinanceiroControllerFactory.invoiceRepo = deps.invoiceRepo
    if (deps.paymentRepo) FinanceiroControllerFactory.paymentRepo = deps.paymentRepo
    if (deps.pixTxRepo) FinanceiroControllerFactory.pixTxRepo = deps.pixTxRepo
    if (deps.auditRepo) FinanceiroControllerFactory.auditRepo = deps.auditRepo
    if (deps.pixGateway) {
      FinanceiroControllerFactory.pixGateway = deps.pixGateway
      FinanceiroControllerFactory.pixQrCodeService = new PixQrCodeGenerationService(deps.pixGateway)
    }
  }

  static reset(): void {
    FinanceiroControllerFactory.configure({
      invoiceRepo: new PrismaInvoiceRepository(FinanceiroControllerFactory.db),
      paymentRepo: new PrismaPaymentRepository(FinanceiroControllerFactory.db),
      pixTxRepo: new PrismaPixTransactionRepository(FinanceiroControllerFactory.db),
      auditRepo: new PrismaFinancialAuditRepository(FinanceiroControllerFactory.db),
      pixGateway: new FakePixGateway(),
    })
  }

  static makeGerarFaturaUseCase(): GerarFaturaUseCase {
    return new GerarFaturaUseCase(FinanceiroControllerFactory.invoiceRepo)
  }

  static makeEmitirFaturaUseCase(): EmitirFaturaUseCase {
    return new EmitirFaturaUseCase(FinanceiroControllerFactory.invoiceRepo)
  }

  static makeCancelarFaturaUseCase(): CancelarFaturaUseCase {
    return new CancelarFaturaUseCase(
      FinanceiroControllerFactory.invoiceRepo,
      FinanceiroControllerFactory.paymentRepo
    )
  }

  static makeProcessarPagamentoPixUseCase(): ProcessarPagamentoPixUseCase {
    return new ProcessarPagamentoPixUseCase(
      FinanceiroControllerFactory.invoiceRepo,
      FinanceiroControllerFactory.paymentRepo,
      FinanceiroControllerFactory.pixTxRepo,
      FinanceiroControllerFactory.pixGateway
    )
  }

  static makeProcessarEstornoUseCase(): ProcessarEstornoUseCase {
    return new ProcessarEstornoUseCase(
      FinanceiroControllerFactory.paymentRepo,
      FinanceiroControllerFactory.invoiceRepo
    )
  }

  static makeConciliarTransacaoPixUseCase(): ConciliarTransacaoPixUseCase {
    return new ConciliarTransacaoPixUseCase(
      FinanceiroControllerFactory.pixTxRepo,
      FinanceiroControllerFactory.paymentRepo,
      FinanceiroControllerFactory.invoiceRepo
    )
  }

  static makeListarFaturamentoUseCase(): ListarFaturamentoUseCase {
    return new ListarFaturamentoUseCase(FinanceiroControllerFactory.invoiceRepo)
  }

  static makeMarcarFaturaVencidaUseCase(): MarcarFaturaVencidaUseCase {
    return new MarcarFaturaVencidaUseCase(FinanceiroControllerFactory.invoiceRepo)
  }

  static getInvoiceRepository(): IInvoiceRepository {
    return FinanceiroControllerFactory.invoiceRepo
  }

  static getPaymentRepository(): IPaymentRepository {
    return FinanceiroControllerFactory.paymentRepo
  }

  static getPixTransactionRepository(): IPixTransactionRepository {
    return FinanceiroControllerFactory.pixTxRepo
  }
}
