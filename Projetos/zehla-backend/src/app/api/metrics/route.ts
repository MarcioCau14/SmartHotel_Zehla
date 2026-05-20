// src/app/api/metrics/route.ts
import { apiRegister } from '@/lib/metrics/api-metrics';

export const dynamic = 'force-dynamic';

export async function GET() {  
  const metrics = await apiRegister.metrics();  
    
  return new Response(metrics, {  
    status: 200,  
    headers: {  
      'Content-Type': apiRegister.contentType,  
      'Cache-Control': 'no-store',  
    },  
  });
}
