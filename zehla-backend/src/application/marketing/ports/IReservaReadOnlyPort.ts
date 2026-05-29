export interface IReservaReadOnlyPort {
  buscarPorId(id: string): Promise<{ id: string; hospedeNome: string; dataCheckIn: Date; dataCheckOut: Date; quartoId?: string } | null>
}
