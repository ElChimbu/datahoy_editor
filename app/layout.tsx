import type { Metadata } from 'next';
import './globals.css';
import ToastRoot from '@/components/ui/ToastProvider';

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
      <body>
        <ToastRoot>{children}</ToastRoot>
      </body>
    </html>
  );
}

