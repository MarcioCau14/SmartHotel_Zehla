import { Metadata } from 'next';
import { LinkInBioEditor } from '@/components/linkinbio/LinkInBioEditor';

export const metadata: Metadata = {
  title: 'Link-in-Bio Profissional — Editor | Zélla',
  description: 'Crie e personalize seu Link-in-Bio Profissional para o Instagram.',
  robots: { index: false, follow: false },
};

export default function LinkInBioEditorPage() {
  return <LinkInBioEditor />;
}