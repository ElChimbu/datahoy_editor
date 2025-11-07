import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataHoy Editor',
  description: 'Editor visual de páginas para DataHoy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

