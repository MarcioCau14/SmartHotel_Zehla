import sharp from 'sharp';


export interface PhotoValidationResult {
  valid: boolean;
  errors: string[];
  width?: number;
  height?: number;
  size?: number;
}

/**
 * Valida se uma foto segue os padrões técnicos do Google Business Profile.
 * - Orientação: Paisagem (Horizontal)
 * - Resolução Mínima: 1024x683px
 * - Tamanho Máximo: 10MB
 */
export async function validatePhoto(fileBuffer: Buffer): Promise<PhotoValidationResult> {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB

  try {
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return { valid: false, errors: ['Não foi possível ler os metadados da imagem.'] };
    }

    // 1. Validar Orientação (Landscape)
    if (metadata.width <= metadata.height) {
      errors.push('A foto deve estar na orientação paisagem (horizontal).');
    }

    // 2. Validar Resolução Mínima (1024x683px)
    if (metadata.width < 1024 || metadata.height < 683) {
      errors.push('A resolução mínima permitida é 1024x683 pixels.');
    }

    // 3. Validar Tamanho do Arquivo
    if (fileBuffer.length > maxSize) {
      errors.push('O tamanho do arquivo não pode exceder 10MB.');
    }

    return {
      valid: errors.length === 0,
      errors,
      width: metadata.width,
      height: metadata.height,
      size: fileBuffer.length
    };

  } catch (error) {
    return {
      valid: false,
      errors: ['Arquivo de imagem inválido ou corrompido.']
    };
  }
}
