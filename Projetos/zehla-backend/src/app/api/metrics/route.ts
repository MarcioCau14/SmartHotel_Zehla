import { apiRegister } from '@/lib/metrics/api-metrics';

import { withApiSecurity } from '@/lib/server/with-api-security';

// src/app/api/metrics/route.ts

export const dynamic = 'force-dynamic';

async function _GET() : void {  
  const metrics = await apiRegister.metrics();  
    
  return new Response(metrics, {  
    status: 200,  
    headers: {  
      'Content-Type': apiRegister.contentType,  
      'Cache-Control': 'no-store',  
    },  
  });
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

