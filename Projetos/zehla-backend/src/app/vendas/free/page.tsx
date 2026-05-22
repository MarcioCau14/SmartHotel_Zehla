import { redirect } from 'next/navigation';

export default function VendasFreeRedirect() {
  redirect('/vendas#gratis');
}
