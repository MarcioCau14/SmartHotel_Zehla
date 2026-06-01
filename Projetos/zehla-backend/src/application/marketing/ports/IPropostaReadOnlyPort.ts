export interface IPropostaReadOnlyPort {
  buscarPorId(id: string): Promise<{ id: string; leadId: string; status: string; valorTotal: number } | null>
}
