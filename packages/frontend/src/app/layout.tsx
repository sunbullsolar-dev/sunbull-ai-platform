import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
});

export const metadata: Metadata = {
  title: 'Sunbull AI - Solar Savings in Minutes',
  description:
    'Get your solar proposal in 2 minutes. See your savings, compare financing options, and schedule installation online.',
  keywords: ['solar', 'energy', 'savings', 'solar panels', 'renewable energy'],
  openGraph: {
    title: 'Sunbull AI - Solar Savings in Minutes',
    description: 'Get your solar proposal in 2 minutes',
    type: 'website',
    url: 'https://sunbull.ai',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable} scroll-smooth`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0F0F0F" />
      </head>
      <body className="bg-dark-bg text-gray-100">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
