import { db } from "@/lib/db";

interface CaptureResult {
  captured: boolean;
  field: string | null;
  value: string | null;
}

// Regex para detectar dados no texto da mensagem
const PHONE_PATTERNS = [
  /\(?(\d{2})\)?\s?9?\d{4,5}-?\d{4}/g, // (11) 91234-5678
  /\+?55\s?\d{2}\s?9?\d{4,5}-?\d{4}/g, // +55 11 91234-5678
  /\b\d{10,11}\b/g, // 11912345678
];

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function extractContactData(text: string): {
  phones: string[];
  emails: string[];
} {
  const phones: string[] = [];
  const emails: string[] = [];

  for (const pattern of PHONE_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const cleaned = match[0].replace(/[^\d]/g, "");
      if (cleaned.length >= 10 && cleaned.length <= 13) {
        phones.push(cleaned);
      }
    }
  }

  const emailMatches = text.matchAll(EMAIL_PATTERN);
  for (const match of emailMatches) {
    emails.push(match[0].toLowerCase());
  }

  return { phones: [...new Set(phones)], emails: [...new Set(emails)] };
}

export async function persistCapturedData(
  guestId: string,
  data: { phones: string[]; emails: string[] }
): Promise<CaptureResult> {
  const updateData: Record<string, any> = {};
  let capturedField: string | null = null;
  let capturedValue: string | null = null;

  try {
    const guest = await db.guest.findUnique({ where: { id: guestId } });
    if (!guest) return { captured: false, field: null, value: null };

    // Capturar telefone real se ainda nao tem
    if (!guest.realPhone && data.phones.length > 0) {
      updateData.realPhone = data.phones[0];
      capturedField = "realPhone";
      capturedValue = data.phones[0];
    }

    // Capturar email real se ainda nao tem
    if (!guest.realEmail && data.emails.length > 0) {
      updateData.realEmail = data.emails[0];
      if (!capturedField) {
        capturedField = "realEmail";
        capturedValue = data.emails[0];
      }
    }

    if (Object.keys(updateData).length > 0) {
      updateData.leadCapturedAt = new Date();
      await db.guest.update({
        where: { id: guestId },
        data: updateData,
      });
    }

    return {
      captured: Object.keys(updateData).length > 0,
      field: capturedField,
      value: capturedValue,
    };
  } catch (error) {
    console.error("Failed to persist captured data:", error);
    return { captured: false, field: null, value: null };
  }
}
