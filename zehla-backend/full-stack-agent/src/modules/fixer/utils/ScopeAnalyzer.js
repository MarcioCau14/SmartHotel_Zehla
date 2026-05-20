const COMMON_ISOLATION_KEYS = ['tenantId', 'propertyId', 'hotelId', 'ctx.tenantId'];

export class ScopeAnalyzer {
  static findIsolationVariable(content) {
    for (const key of COMMON_ISOLATION_KEYS) {
      const regex = new RegExp(`(const|let|var)\\s+${key}\\b|${key}\\s*[:=]`);
      if (regex.test(content)) return key;
    }

    const paramRegex = new RegExp(`\\{\\s*.*\\b(${COMMON_ISOLATION_KEYS.join('|')})\\b.*\\}`, 'i');
    const match = content.match(paramRegex);
    if (match) return match[1];

    return null;
  }
}
