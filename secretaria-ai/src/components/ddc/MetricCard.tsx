'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  color?: string;
  bgColor?: string;
  badge?: string;
  badgeColor?: string;
  trend?: string;
  delay?: number;
  onClick?: () => void;
  live?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'from-emerald-500 to-cyan-500',
  bgColor = 'from-emerald-500/20 to-cyan-500/10',
  badge,
  badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  trend,
  delay = 0,
  onClick,
  live = false
}: MetricCardProps) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.5,
        ease: 'easeOut' as any
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as any
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp className="w-3 h-3" />;
    if (changeType === 'negative') return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-emerald-400';
    if (changeType === 'negative') return 'text-red-400';
    return 'text-white/60';
  };

 return (  
   <motion.div variants={fadeInUp} initial="hidden" animate="visible" onClick={onClick}>  
     <Card className={`bg-gradient-to-br ${bgColor} border border-white/[0.08] hover:border-white/[0.12] transition-all duration-300 overflow-hidden cursor-pointer ${onClick ? 'hover:scale-[1.02]' : ''}`}>  
       {live && (  
         <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full m-3">  
           <motion.div  
             className="absolute inset-0 bg-emerald-500 rounded-full"  
             animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}  
             transition={{ duration: 1.5, repeat: Infinity }}  
           />  
         </div>  
       )}

       <CardContent className="p-4">  
         <motion.div  
           className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`}  
           animate={{ opacity: [0.05, 0.08, 0.05] }}  
           transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}  
         />

         <div className="relative">  
           <div className="flex items-start justify-between mb-3">  
             <div className="flex items-center gap-2">  
               {Icon && (  
                 <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>  
                   <Icon className="w-4 h-4 text-white" />  
                 </div>  
               )}  
               <span className="text-[10px] text-white/50 uppercase tracking-wider">{title}</span>  
             </div>  
             {badge && (  
               <motion.div  
                 className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${badgeColor}`}  
                 animate={live ? pulseAnimation : {}}  
               >  
                 {badge}  
               </motion.div>  
             )}  
           </div>

           <motion.div className="mb-2" animate={live ? pulseAnimation : {}}>  
             <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</div>  
             {change && (  
               <div className={`text-[10px] ${getChangeColor()} font-medium mt-0.5 flex items-center gap-1`}>  
                 {getChangeIcon()}  
                 {change}  
               </div>  
             )}  
           </motion.div>

           {trend && (  
             <div className="flex items-center gap-1.5 mt-2">  
               {changeType === 'positive' ? (  
                 <ArrowUpRight className={`w-3 h-3 ${getChangeColor()}`} />  
               ) : changeType === 'negative' ? (  
                 <ArrowDownRight className={`w-3 h-3 ${getChangeColor()}`} />  
               ) : null}  
               <span className="text-[9px] text-white/50 font-medium">{trend}</span>  
             </div>  
           )}

           <div className="mt-3 h-1 bg-white/[0.05] rounded-full overflow-hidden">  
             <motion.div  
               className={`h-full bg-gradient-to-r ${color}`}  
               initial={{ width: 0 }}  
               animate={{ width: `${Math.random() * 30 + 70}%` }}  
               transition={{ duration: 1, delay: delay + 0.2 }}  
             />  
           </div>  
         </div>  
       </CardContent>  
     </Card>  
   </motion.div>  
 );  
}  

