import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Local Vector Database',
  description: 'A fully client-side vector search application using Next.js and IndexedDB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-neutral-50 dark:bg-neutral-900 min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
