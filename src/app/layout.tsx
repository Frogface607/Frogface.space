import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '8FATES — Wordle для моральных дилемм',
  description:
    'Ежедневная интерактивная история. Твои выборы. AI-концовка. Уникальная статистика. Каждый день новая дилемма.',
  openGraph: {
    title: '8FATES — Wordle для моральных дилемм',
    description: 'Одна история в день. 7 выборов. 8 судеб. А ты на что способен?',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
