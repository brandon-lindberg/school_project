import { Inter, Mulish } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ClientNavbar from './components/ClientNavbar';
import { metadata, viewport } from './metadata';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const mulish = Mulish({
  subsets: ['latin'],
  variable: '--font-heading',
});

export { metadata, viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mulish.variable} antialiased`}>
        <Providers>
          <ClientNavbar />
          <main className="lg:pl-64 pt-[60px] lg:pt-0 min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
