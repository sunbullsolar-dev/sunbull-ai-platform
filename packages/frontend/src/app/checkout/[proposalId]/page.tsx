import CheckoutPageClient from './CheckoutPageClient';

export function generateStaticParams() {
  return [{ proposalId: 'demo' }];
}

export default function CheckoutPage({ params }: { params: { proposalId: string } }) {
  return <CheckoutPageClient proposalId={params.proposalId} />;
}
