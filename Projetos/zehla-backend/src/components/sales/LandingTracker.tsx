'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function LandingTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const data: Record<string, string> = {};

    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmContent = searchParams.get('utm_content');
    const plan = searchParams.get('plan');
    const ref = searchParams.get('ref');
    const leadId = searchParams.get('leadId');

    if (utmSource) data.utm_source = utmSource;
    if (utmMedium) data.utm_medium = utmMedium;
    if (utmCampaign) data.utm_campaign = utmCampaign;
    if (utmContent) data.utm_content = utmContent;
    if (plan) data.plan = plan;
    if (ref) data.ref = ref;

    if (leadId) {
      data.leadId = leadId;
    } else {
      const stored = document.cookie.split('; ').find(c => c.startsWith('zehla_lead_id='));
      if (stored) data.leadId = stored.split('=')[1];
    }

    if (Object.keys(data).length > 0) {
      data.url = window.location.href;
      data.referrer = document.referrer || '';
      data.timestamp = Date.now().toString();

      // Fire and forget
      fetch('/api/sales/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});

      // Store UTM in cookies for session persistence
      if (utmSource) {
        document.cookie = `zehla_utm_source=${utmSource};path=/;max-age=86400`;
      }
      if (utmCampaign) {
        document.cookie = `zehla_utm_campaign=${utmCampaign};path=/;max-age=86400`;
      }
      if (plan) {
        document.cookie = `zehla_landing_plan=${plan};path=/;max-age=86400`;
      }
    }
  }, [searchParams]);

  return null;
}
