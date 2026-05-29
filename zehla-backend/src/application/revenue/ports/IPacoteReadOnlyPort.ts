import { Result } from '../../../shared/Result'

export interface IPacoteReadOnlyPort {
  listarPacotesAtivosPorPropriedade(propriedadeId: string): Promise<Result<Array<{ id: string; nome: string; tipoQuarto: string; valor: number }>, Error>>
}
