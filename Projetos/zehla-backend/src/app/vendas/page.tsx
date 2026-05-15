import { redirect } from 'next/navigation';

export default function VendasIndex() {
  // Redireciona para o plano PRO como padrão (mais vendido)
  redirect('/vendas/pro');
}
