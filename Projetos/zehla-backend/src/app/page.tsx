import { getDynamicHeadline } from '@/lib/landing/dynamicHeadlines';
import { LandingClient } from '@/components/landing/LandingClient';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ZehlaLandingPage({ searchParams }: PageProps) {
  const campaign = (searchParams.utm_campaign as string) || '';
  const headline = getDynamicHeadline(campaign);

  return (
    <LandingClient
      headline={headline.h1}
      highlight={headline.h1Highlight}
      subtitle={headline.subtitle}
    />
  );
}
