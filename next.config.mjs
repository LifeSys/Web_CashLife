/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Next.js 16 bloquea por defecto en modo desarrollo las peticiones que
  // no vengan de localhost — sin esto, entrar desde el celular (ya sea
  // por la IP de red, ej. http://192.168.1.39:3000, o por un túnel como
  // el de VS Code, *.devtunnels.ms) hace fallar las Server Actions —
  // incluida la que carga el usuario local — y eso manda a /login como
  // si no hubiera sesión.
  allowedDevOrigins: [
    '192.168.1.39',
    // Los túneles de VS Code usan dos niveles de subdominio
    // (ej. zlrm2t7z-3000.brs.devtunnels.ms) — un solo "*" solo cubre un
    // nivel, hace falta el comodín recursivo "**" para cubrir cualquier
    // cantidad de niveles y que no se rompa si cambia el formato.
    '**.devtunnels.ms',
  ],
}

export default nextConfig
