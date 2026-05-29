export interface IHmacVerifierPort {
  sign(payload: string, secret: string): string
  verify(payload: string, signature: string, secret: string): boolean
}
