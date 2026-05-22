'use client';

import { useEffect, useState } from 'react';

export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  ref: string;
}

const UTM_KEYS: (keyof UTMParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'];

export function useUTMParams() {
  const [params, setParams] = useState<UTMParams>({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    ref: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    const extracted: Partial<UTMParams> = {};
    for (const key of UTM_KEYS) {
      const value = search.get(key);
      if (value) extracted[key] = value;
    }
    setParams({
      utm_source: extracted.utm_source || '',
      utm_medium: extracted.utm_medium || '',
      utm_campaign: extracted.utm_campaign || '',
      utm_term: extracted.utm_term || '',
      utm_content: extracted.utm_content || '',
      ref: extracted.ref || '',
    });
  }, []);

  return params;
}

export function getUTMQueryString(): string {
  if (typeof window === 'undefined') return '';
  const search = new URLSearchParams(window.location.search);
  const utmParts: string[] = [];
  for (const key of UTM_KEYS) {
    const value = search.get(key);
    if (value) utmParts.push(`${key}=${encodeURIComponent(value)}`);
  }
  return utmParts.length > 0 ? `?${utmParts.join('&')}` : '';
}
