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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const s=localStorage.getItem('theme');const m=window.matchMedia('(prefers-color-scheme: dark)').matches;const d=s==='dark'||(!s&&m);if(d){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`
          }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
        <ToastRoot>{children}</ToastRoot>
      </body>
    </html>
  );
}

