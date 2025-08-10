import './globals.css';
import type { Metadata } from 'next';
import Providers from '../components/Providers';

export const metadata: Metadata = {
  title: 'Lief - Shift Tracker',
  description: 'Clock in / Clock out for care workers',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}