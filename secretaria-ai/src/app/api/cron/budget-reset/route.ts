import { NextRequest, NextResponse } from 'next/server';  
import { db } from '@/lib/db';

// Cron: Reset daily budget guard state at midnight (UTC)  
// Triggered by Vercel Cron: 0 0 * * *  
export async function GET(request: NextRequest) {  
 const authHeader = request.headers.get('authorization');  
 const cronSecret = process.env.CRON_SECRET;

 if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {  
   console.log('[Cron:budget-reset] No auth — running in mock mode');  
 }

 try {  
   const today = new Date().toISOString().split('T')[0];

   await db.budgetGuardState.upsert({  
     where: { date: today },  
     create: {  
       date: today,  
       dailySpendUsd: 0,  
       dailyBudgetUsd: 50,  
       monthlySpendUsd: 0,  
       monthlyBudgetUsd: 1500,  
       criticalLevel: 'nominal',  
     },  
     update: {  
       dailySpendUsd: 0,  
       criticalLevel: 'nominal',  
     },  
   });

   console.log(`[Cron:budget-reset] Budget reset for ${today}`);

   return NextResponse.json({  
     ok: true,  
     message: 'Budget guard reset for today',  
     date: today,  
     mode: 'mock',  
   });  
 } catch (error) {  
   console.error('[Cron:budget-reset] Error:', error);  
   return NextResponse.json(  
     { ok: false, error: 'Budget reset failed' },  
     { status: 500 }  
   );  
 }  
}  

