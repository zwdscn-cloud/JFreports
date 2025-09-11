/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 启用API路由
  distDir: 'dist',
  // 允许开发环境跨域访问
  allowedDevOrigins: ['192.168.1.16'],
}

export default nextConfig
