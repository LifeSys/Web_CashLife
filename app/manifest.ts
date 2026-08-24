import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CashLife — Controla tu dinero, vive mejor',
    short_name: 'CashLife',
    description: 'Aplicación para gestionar tu dinero de forma simple y rápida',
    start_url: '/dashboard',
    // "standalone" es lo que hace que, al agregarla a la pantalla de
    // inicio, abra como app propia sin la barra de direcciones ni la
    // barra de herramientas del navegador.
    display: 'standalone',
    background_color: '#09090B',
    theme_color: '#09090B',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
