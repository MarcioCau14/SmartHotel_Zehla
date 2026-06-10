export type GuidebookError =
  | { code: 'ID_REQUIRED'; field: 'guide_id' | 'property_id' }
  | { code: 'SECTION_ALREADY_EXISTS'; sectionId: string }
  | { code: 'SECTION_NOT_FOUND'; sectionId: string }
  | { code: 'REORDER_MISMATCH'; expected: number; received: number }
  | { code: 'INVALID_TRANSITION'; from: string; to: string }
  | { code: 'SECTION_ID_REQUIRED' }
  | { code: 'INVALID_ORDER'; detail: string }
  | { code: 'LOCALIZED_CONTENT_REQUIRED'; detail: string }
  | { code: 'LANGUAGE_REQUIRED' }

export type SectionError =
  | { code: 'ID_REQUIRED' }
  | { code: 'NEGATIVE_ORDER' }
  | { code: 'CONTENT_REQUIRED'; locale: string }
  | { code: 'TITLE_REQUIRED'; locale: string }
  | { code: 'LANGUAGE_REQUIRED' }
