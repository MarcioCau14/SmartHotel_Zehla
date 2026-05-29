import { Result } from '../../../shared/Result'

export interface IPropostaReadOnlyPort {
  contarPropostasPorLeadComMaisDe(propriedadeId: string, dias: number): Promise<Result<number, Error>>
}
