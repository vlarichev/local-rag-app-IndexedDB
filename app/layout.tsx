import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Header from './components/Header'
import Footer from './components/Footer'
import ParticlesBackground from './components/ParticlesBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Local Vector Database',
  description: 'A fully client-side vector search application using Next.js and IndexedDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="min-h-screen flex flex-col bg-white/80 dark:bg-neutral-900/80 text-neutral-900 dark:text-white transition-colors">
            <ParticlesBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
