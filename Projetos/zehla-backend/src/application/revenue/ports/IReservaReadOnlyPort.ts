import { Result } from '../../../shared/Result'

export interface IReservaReadOnlyPort {
  contarReservasConfirmadasPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<number, Error>>
  contarReservasAtivasPorData(propriedadeId: string, data: Date): Promise<Result<number, Error>>
}
