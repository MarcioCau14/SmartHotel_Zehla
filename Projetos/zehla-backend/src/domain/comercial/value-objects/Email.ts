import { Result } from '../../../shared/Result'

export class Email {
  private constructor(public readonly valor: string) {
    Object.freeze(this)
  }

  static criar(email: string): Result<Email, Error> {
    if (typeof email !== 'string' || !email.trim()) {
      return Result.fail(new Error('Email is required'))
    }
    const emailTrim = email.trim().toLowerCase()
    // Simple email regex - in a real system we might use a more robust one
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailTrim)) {
      return Result.fail(new Error('Invalid email format'))
    }
    return Result.ok(new Email(emailTrim))
  }
}