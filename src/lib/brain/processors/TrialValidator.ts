export class TrialValidator {
  static async validate(propertyId: string) {
    return { success: true, property: { id: propertyId, name: 'Secretaria AI' } };
  }
}
