'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function LandingTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmTerm = searchParams.get('utm_term');
    const utmContent = searchParams.get('utm_content');
    const plan = searchParams.get('plan');
    const ref = searchParams.get('ref');

    const payload: Record<string, string> = {};
    if (utmSource) payload.utm_source = utmSource;
    if (utmMedium) payload.utm_medium = utmMedium;
    if (utmCampaign) payload.utm_campaign = utmCampaign;
    if (utmTerm) payload.utm_term = utmTerm;
    if (utmContent) payload.utm_content = utmContent;
    if (plan) payload.plan = plan;
    if (ref) payload.ref = ref;

    if (Object.keys(payload).length > 0) {
      try {
        sessionStorage.setItem('zehla_utm', JSON.stringify(payload));
      } catch {}
      fetch('/api/sales/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, url: window.location.pathname }),
      }).catch(() => {});
    }
  }, [searchParams]);

  return null;
}
