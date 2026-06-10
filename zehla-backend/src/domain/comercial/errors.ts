export type LeadError =
  | { code: 'ID_REQUIRED' }
  | { code: 'CANAL_REQUIRED' }
  | { code: 'PROPERTY_ID_REQUIRED' }
  | { code: 'CAPTURE_DATE_REQUIRED' }
  | { code: 'NAME_TOO_SHORT'; minLength: number }
  | { code: 'INVALID_EMAIL' }
  | { code: 'INVALID_DOCUMENT' }
  | { code: 'DOCUMENT_REQUIRED_FOR_CONVERSION' }
  | { code: 'INVALID_SCORE' }
  | { code: 'INVALID_STATUS'; status: string }
  | { code: 'INVALID_TAGS' }
  | { code: 'INVALID_DATE' }
  | { code: 'INVALID_TRANSITION'; from: string; to: string }
  | { code: 'SCORE_REQUIRED' }
  | { code: 'SCORE_INSUFFICIENT'; minScore: number }
  | { code: 'DOCUMENT_REQUIRED' }

export type PropostaError =
  | { code: 'ID_REQUIRED' }
  | { code: 'LEAD_ID_REQUIRED' }
  | { code: 'PROPERTY_ID_REQUIRED' }
  | { code: 'PACKAGE_ID_REQUIRED' }
  | { code: 'CREATION_DATE_REQUIRED' }
  | { code: 'CHECKOUT_BEFORE_CHECKIN' }
  | { code: 'STAY_TOO_SHORT'; minNights: number }
  | { code: 'CHECKIN_IN_PAST' }
  | { code: 'VALIDITY_IN_PAST' }
  | { code: 'INVALID_GUEST_COUNT' }
  | { code: 'INVALID_TOTAL_VALUE' }
  | { code: 'INVALID_DEPOSIT_VALUE' }
  | { code: 'INVALID_DISCOUNT_VALUE' }
  | { code: 'ZERO_TOTAL_VALUE' }
  | { code: 'DEPOSIT_EXCEEDS_TOTAL' }
  | { code: 'DEPOSIT_EXCEEDS_LIMIT'; maxPercent: number }
  | { code: 'DISCOUNT_EXCEEDS_TOTAL' }
  | { code: 'INVALID_STATUS'; status: string }
  | { code: 'OBSERVATIONS_TOO_LONG'; maxLength: number }
  | { code: 'INVALID_TRANSITION'; from: string; to: string }
  | { code: 'DATES_REQUIRED' }
  | { code: 'TOTAL_REQUIRED' }
  | { code: 'DISCOUNT_EXCEEDS_VALUE' }
  | { code: 'PERCENTAGE_OUT_OF_RANGE'; min: number; max: number }

export type RoiError =
  | { code: 'INVALID_ROOMS'; detail: string }
  | { code: 'INVALID_DAILY_RATE'; detail: string }
  | { code: 'INVALID_OCCUPANCY'; detail: string }
  | { code: 'NEGATIVE_STAFF_COST'; detail: string }

export type CommercialError =
  | LeadError
  | PropostaError
  | RoiError
