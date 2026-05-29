import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
import { Result } from '../../domain/shared/Result'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

export interface EncryptedData {
  iv: string
  ciphertext: string
  tag: string
}

export class AESGCMEncryptor {
  private readonly key: Buffer

  constructor(keyHex: string) {
    if (keyHex.length !== 64) {
      throw new Error('AES-256-GCM key must be 64 hex characters (32 bytes)')
    }
    this.key = Buffer.from(keyHex, 'hex')
  }

  encrypt(plaintext: string): Result<EncryptedData> {
    try {
      const iv = randomBytes(IV_LENGTH)
      const cipher = createCipheriv(ALGORITHM, this.key, iv)

      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf-8'),
        cipher.final(),
      ])

      const tag = cipher.getAuthTag()

      return Result.ok({
        iv: iv.toString('hex'),
        ciphertext: encrypted.toString('hex'),
        tag: tag.toString('hex'),
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Encryption failed'))
    }
  }

  decrypt(data: EncryptedData): Result<string> {
    try {
      const iv = Buffer.from(data.iv, 'hex')
      const encrypted = Buffer.from(data.ciphertext, 'hex')
      const tag = Buffer.from(data.tag, 'hex')

      if (tag.length !== TAG_LENGTH) {
        return Result.fail(new Error('Invalid authentication tag'))
      }

      const decipher = createDecipheriv(ALGORITHM, this.key, iv)
      decipher.setAuthTag(tag)

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ])

      return Result.ok(decrypted.toString('utf-8'))
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Decryption failed'))
    }
  }
}
