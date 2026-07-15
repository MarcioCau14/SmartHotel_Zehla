/**
 * ZEHLA — Zero Data Retention (ZDR) Secure Memory Utility
 * 
 * Implements strict ZDR compliance:
 * - Sensitive variables are processed in memory only
 * - Explicit zero-wiping after use (defense against memory dumps)
 * - No disk serialization of raw PII
 * - Preparation for TEE (Trusted Execution Environment) execution
 * 
 * Confidence Lock: > 0.95 required for any modification.
 */

/**
 * Secure string wrapper that zero-wipes its buffer on destruction.
 * Use this for any sensitive data that must not persist in memory.
 */
export class SecureString {
  private _buffer: Buffer;
  private _destroyed = false;

  constructor(value: string) {
    // Copy to a private buffer so the original string can be GC'd
    this._buffer = Buffer.from(value, 'utf8');
  }

  get value(): string {
    this._assertAlive();
    return this._buffer.toString('utf8');
  }

  get buffer(): Buffer {
    this._assertAlive();
    return Buffer.from(this._buffer); // Return copy, not reference
  }

  get length(): number {
    this._assertAlive();
    return this._buffer.length;
  }

  get isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * Overwrites the internal buffer with zeros.
   * After calling this, any access to value/buffer will throw.
   */
  destroy(): void {
    if (this._destroyed) return;
    // Overwrite with random data first, then zeros (defense against memory forensics)
    for (let i = 0; i < this._buffer.length; i++) {
      this._buffer[i] = (Math.random() * 256) | 0;
    }
    for (let i = 0; i < this._buffer.length; i++) {
      this._buffer[i] = 0;
    }
    this._destroyed = true;
  }

  /**
   * Process a sensitive value and immediately destroy the intermediate.
   * The processor receives the plaintext value and returns a result.
   * The SecureString is destroyed after the processor completes (even if it throws).
   */
  static processAndWipe<T>(
    value: string,
    processor: (secure: SecureString) => T | Promise<T>
  ): T | Promise<T> {
    const secure = new SecureString(value);
    try {
      const result = processor(secure);
      if (result instanceof Promise) {
        return result.finally(() => secure.destroy());
      }
      secure.destroy();
      return result;
    } catch (error) {
      secure.destroy();
      throw error;
    }
  }

  private _assertAlive(): void {
    if (this._destroyed) {
      throw new Error('SECURE_STRING_DESTROYED: Cannot access destroyed SecureString');
    }
  }
}

/**
 * Wipes a string variable by replacing its characters.
 * Note: JavaScript strings are immutable, so this creates a new string.
 * Use SecureString for true in-memory wiping.
 */
export function wipeString(str: string): string {
  return '\x00'.repeat(str.length);
}

/**
 * ZDR-compliant data processor: receives sensitive data,
 * processes it entirely in memory, and ensures no leakage.
 * 
 * @param sensitiveData - The raw sensitive data to process
 * @param processor - A function that receives the data and returns a safe result
 * @returns The processed result (must NOT contain raw sensitive data)
 */
export async function zdrProcess<T>(
  sensitiveData: string,
  processor: (data: string) => Promise<T>
): Promise<T> {
  // Use SecureString to ensure in-memory isolation
  return SecureString.processAndWipe(sensitiveData, async (secure) => {
    const result = await processor(secure.value);
    return result;
  });
}

/**
 * Creates a ZDR-safe wrapper for processing PII fields from database records.
 * Extracts the PII, processes it, and ensures the raw value is wiped.
 */
export function createZDRFieldProcessor<T>(
  processor: (piiValue: string) => T | Promise<T>,
  fieldLabel: string = 'PII_FIELD'
): (rawValue: string) => T | Promise<T> {
  return (rawValue: string) => {
    return SecureString.processAndWipe(rawValue, (secure) => {
      if (process.env.LOG_LEVEL === 'debug') {
        console.log(JSON.stringify({
          level: 'zdr',
          event: 'ZDR_FIELD_PROCESSING',
          field: fieldLabel,
          timestamp: new Date().toISOString(),
        }));
      }
      return processor(secure.value);
    });
  };
}