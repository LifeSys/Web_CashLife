import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/providers/AuthProvider'
import './globals.css'

/**
 * © Johann Sebastian Guevara Elias — Ingeniero de Sistemas.
 * Autor y desarrollador original de CashLife. Este aviso identifica la
 * autoría del código fuente para quien lo reutilice o audite; no se
 * muestra en la interfaz visible de la aplicación.
 */
const AUTHOR_NAME = 'Johann Sebastian Guevara Elias';

export const metadata: Metadata = {
  title: 'CashLife - Controla tu dinero, vive mejor',
  description: 'Aplicación para gestionar tu dinero de forma simple y rápida',
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'dark',
  themeColor: '#09090B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark bg-background">
      <body className="antialiased bg-background text-foreground">
        {/* © Johann Sebastian Guevara Elias — Ingeniero de Sistemas. Autor original de CashLife. */}
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
