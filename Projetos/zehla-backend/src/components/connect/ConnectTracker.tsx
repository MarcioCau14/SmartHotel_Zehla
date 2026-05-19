'use client';

import { createContext, useContext, useEffect } from 'react';

interface TrackerContextType {
  trackClick: (linkId: string) => void;
}

const TrackerContext = createContext<TrackerContextType>({ trackClick: () => {} });

export function useConnectTracker() {
  return useContext(TrackerContext);
}

export function ConnectTracker({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const track = (type: 'view' | 'click', linkId?: string) => {
    try {
      const payload = { slug, type, ...(linkId ? { linkId } : {}) };
      navigator.sendBeacon('/api/connect/analytics/track', JSON.stringify(payload));
    } catch {
      // silent
    }
  };

  useEffect(() => {
    track('view');
  }, [slug]);

  const trackClick = (linkId: string) => track('click', linkId);

  return (
    <TrackerContext.Provider value={{ trackClick }}>
      {children}
    </TrackerContext.Provider>
  );
}
