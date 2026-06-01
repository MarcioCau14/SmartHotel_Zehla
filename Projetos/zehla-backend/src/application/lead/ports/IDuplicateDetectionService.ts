export interface IDuplicateDetectionService {
  findByEmail(email: string): Promise<{ id: string } | null>
  findByPhone(phone: string): Promise<{ id: string } | null>
  isDuplicate(email?: string, phone?: string): Promise<boolean>
}
