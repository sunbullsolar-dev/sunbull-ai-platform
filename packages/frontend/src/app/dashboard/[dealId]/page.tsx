import DashboardPageClient from './DashboardPageClient';

export function generateStaticParams() {
  return [{ dealId: 'demo' }];
}

export default function DashboardPage({ params }: { params: { dealId: string } }) {
  return <DashboardPageClient dealId={params.dealId} />;
}
