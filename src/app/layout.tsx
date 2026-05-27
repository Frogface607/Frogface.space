import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Frogface — болото',
  description:
    'Frogface — уставший предприниматель с нулём денег, пытается выбраться из болота. Сайт-пространство по которому можно ходить.',
  openGraph: {
    title: 'Frogface',
    description: 'Cartoon swamp world by Серёжа Орлов.',
    url: 'https://frogface.space',
    siteName: 'Frogface',
    locale: 'ru_RU',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0e1218',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${geist.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
