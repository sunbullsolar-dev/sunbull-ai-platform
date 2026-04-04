import ProposalPageClient from './ProposalPageClient';

export function generateStaticParams() {
  return [{ id: 'demo' }];
}

export default function ProposalPage({ params }: { params: { id: string } }) {
  return <ProposalPageClient id={params.id} />;
}
