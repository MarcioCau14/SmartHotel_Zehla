import { useEffect, useCallback, useRef } from 'react';

import { trackEvent } from '@/lib/eventTracker';


// src/hooks/useEventTracker.ts — ZEHLA Brain v4: React Hook para Tracking
'use client';


interface UseEventTrackerOptions {
  email?: string | null;
  autoTrackPageView?: boolean;
}

/**
 * React hook para tracking automático de eventos no ZEHLA Brain
 * 
 * @example
 * const { trackClick, trackAction } = useEventTracker({ email: user.email });
 * <button onClick={() => trackClick('pricing_button')}>Ver Preços</button>
 */
export function useEventTracker(options: UseEventTrackerOptions = : void {}) {
  try {
  const { email, autoTrackPageView = true } = options;
  const hasTrackedPageView = useRef(false);

  // Auto-track page view on mount
  useEffect(() => {
    if (autoTrackPageView && email && !hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      trackEvent(email, 'LANDING_VISIT', {
        page: window.location.pathname,
        title: document.title,
      });
    }
  }, [email, autoTrackPageView]);

  // Track click event
  const trackClick = useCallback(
    (elementId: string, metadata?: Record<string, any>) => {
      if (!email) return;
      trackEvent(email, 'LINK_CLICK', {
        elementId,
        page: window.location.pathname,
        ...metadata,
      });
    },
    [email]
  );

  // Track custom action
  const trackAction = useCallback(
    (eventType: string, metadata?: Record<string, any>) => {
      if (!email) return;
      trackEvent(email, eventType, metadata);
    },
    [email]
  );

  return { trackClick, trackAction, trackEvent: trackAction };
}
