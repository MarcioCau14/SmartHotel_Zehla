import { redirect } from 'next/navigation';

export default function VendasIndex() {
  // Redireciona para o plano Grátis como porta de entrada
  redirect('/vendas/free');
}
