export type CampaignError =
  | { code: 'ID_REQUIRED' }
  | { code: 'PROPERTY_ID_REQUIRED' }
  | { code: 'NAME_REQUIRED' }
  | { code: 'AUDIENCE_REQUIRED' }
  | { code: 'INVALID_AUDIENCE'; audience: string }
  | { code: 'START_DATE_REQUIRED' }
  | { code: 'END_DATE_REQUIRED' }
  | { code: 'END_BEFORE_START' }
  | { code: 'FINANCIAL_CONTENT_UNVERIFIED' }
  | { code: 'INVALID_TRANSITION'; from: string; to: string }
  | { code: 'APPROVE_INVALID_STATE'; status: string }
  | { code: 'SCHEDULE_INVALID_STATE'; status: string }
  | { code: 'EXECUTE_INVALID_STATE'; status: string }
  | { code: 'COMPLETE_INVALID_STATE'; status: string }
  | { code: 'CANCEL_INVALID_STATE'; status: string }

export type PostError =
  | { code: 'ID_REQUIRED' }
  | { code: 'PROPERTY_ID_REQUIRED' }
  | { code: 'CHANNEL_REQUIRED' }
  | { code: 'CHANNEL_NOT_SUPPORTED'; channel: string }
  | { code: 'CONTENT_ID_REQUIRED' }
  | { code: 'TYPE_REQUIRED' }
  | { code: 'MEDIA_REQUIRED_FOR_PROMO' }
  | { code: 'INVALID_TRANSITION'; from: string; to: string }

export type ReviewError =
  | { code: 'ID_REQUIRED' }
  | { code: 'PROPERTY_ID_REQUIRED' }
  | { code: 'GUEST_NAME_REQUIRED' }
  | { code: 'PLATFORM_REQUIRED' }
  | { code: 'RATING_OUT_OF_RANGE'; value: number }
  | { code: 'TEXT_REQUIRED' }
  | { code: 'SENTIMENT_REQUIRED' }
  | { code: 'STAY_DATE_REQUIRED' }
  | { code: 'INVALID_TRANSITION'; from: string; to: string }
  | { code: 'ALREADY_REPLIED' }
  | { code: 'REPLY_TEXT_REQUIRED' }
  | { code: 'REPLY_BLOCKED' }
  | { code: 'REPLY_TOO_GENERIC'; minLength: number }
  | { code: 'ESCALATE_INVALID_STATE' }
  | { code: 'PUBLISH_INVALID_STATE' }

export type MetricaError =
  | { code: 'ID_REQUIRED' }
  | { code: 'PROPERTY_ID_REQUIRED' }
  | { code: 'START_DATE_REQUIRED' }
  | { code: 'END_DATE_REQUIRED' }
  | { code: 'START_AFTER_END' }
  | { code: 'INVALID_SENTIMENT'; value: number }
  | { code: 'INVALID_RATING'; value: number }
  | { code: 'INVALID_RESPONSE_RATE'; value: number }

export type ConteudoError =
  | { code: 'ID_REQUIRED' }
  | { code: 'TEXT_REQUIRED' }
  | { code: 'INVALID_TONE'; tone: string }
  | { code: 'INVALID_VERSION' }

export type MarketingError =
  | CampaignError
  | PostError
  | ReviewError
  | MetricaError
  | ConteudoError
