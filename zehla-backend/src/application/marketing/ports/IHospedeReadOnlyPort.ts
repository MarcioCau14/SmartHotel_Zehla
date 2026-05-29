export interface IHospedeReadOnlyPort {
  buscarPorId(id: string): Promise<{ id: string; nome: string; email?: string; telefone?: string; optInMarketing?: boolean } | null>
}
