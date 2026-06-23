'use client';

import Link from 'next/link';  
import { motion } from 'framer-motion';  
import { Home, ArrowLeft } from 'lucide-react';  
import { Button } from '@/components/ui/button';

export default function NotFound() {  
 return (  
   <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">  
     <motion.div  
       initial={{ opacity: 0, scale: 0.95 }}  
       animate={{ opacity: 1, scale: 1 }}  
       className="max-w-md w-full text-center"  
     >  
       <motion.div  
         initial={{ scale: 0 }}  
         animate={{ scale: 1 }}  
         transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}  
         className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6"  
       >  
         <span className="text-4xl font-bold text-emerald-400">404</span>  
       </motion.div>

       <motion.h1  
         initial={{ opacity: 0, y: 20 }}  
         animate={{ opacity: 1, y: 0 }}  
         transition={{ delay: 0.3 }}  
         className="text-3xl font-bold text-white mb-3"  
       >  
         Pagina nao encontrada  
       </motion.h1>

       <motion.p  
         initial={{ opacity: 0, y: 20 }}  
         animate={{ opacity: 1, y: 0 }}  
         transition={{ delay: 0.4 }}  
         className="text-neutral-400 mb-8"  
       >  
         A pagina que voce procura nao existe ou foi movida.  
       </motion.p>

       <motion.div  
         initial={{ opacity: 0, y: 20 }}  
         animate={{ opacity: 1, y: 0 }}  
         transition={{ delay: 0.5 }}  
         className="flex flex-col sm:flex-row gap-3 justify-center"  
       >  
         <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>  
           <Link href="/">  
             <Home className="w-4 h-4 mr-2" />  
             Inicio  
           </Link>  
         </Button>

         <Button variant="outline" className="border-zinc-700 text-zinc-300" asChild>  
           <Link href="/login">  
             <ArrowLeft className="w-4 h-4 mr-2" />  
             Login  
           </Link>  
         </Button>  
       </motion.div>

       <motion.p  
         initial={{ opacity: 0 }}  
         animate={{ opacity: 1 }}  
         transition={{ delay: 0.7 }}  
         className="text-neutral-600 text-xs mt-8"  
       >  
         (c) 2025 ZEHLA SmartHotel  
       </motion.p>  
     </motion.div>  
   </div>  
 );  
}  

