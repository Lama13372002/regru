/** @type {import('next').NextConfig} */
const nextConfig = {
  // Убираем output: 'export', чтобы Vercel мог использовать свой оптимизированный механизм деплоя
  // distDir: 'out', - также убираем, будет использоваться стандартная директория .next
  images: {
    // unoptimized: true, - убираем, так как Vercel оптимизирует изображения
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.same-assets.com', // Добавлено для поддержки дополнительных изображений
      },
    ],
  },
  // trailingSlash: true, - убираем, не требуется для Vercel
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}

export default nextConfig
