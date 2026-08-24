import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import './globals.css'

// Corre ANTES del primer render (bloqueante, en <head>) para que la página
// nazca ya con el tema correcto — sin esto, se vería un parpadeo del tema
// por defecto antes de que React monte y aplique la preferencia real
// (que vive en Settings/base de datos, tarda un round-trip en cargar).
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem('cashlife-theme');
    var root = document.documentElement;
    if (theme === 'oscuro') root.classList.add('dark');
    else if (theme === 'claro') root.classList.add('light');
    // sin valor guardado o 'sistema': no se agrega clase, el CSS ya
    // resuelve @media (prefers-color-scheme: dark) por su cuenta.
  } catch (e) {}
})();
`;

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
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-64.png', type: 'image/png', sizes: '64x64' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        {/* © Johann Sebastian Guevara Elias — Ingeniero de Sistemas. Autor original de CashLife. */}
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
