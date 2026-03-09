/** @type {import('next').NextConfig} */
const bundleAnalyzerPkg = require('@next/bundle-analyzer')

const withBundleAnalyzer = (bundleAnalyzerPkg && (bundleAnalyzerPkg.default || bundleAnalyzerPkg))({ enabled: process.env.ANALYZE === 'true' })

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['vskptuiocefcnhltwkof.supabase.co'],
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = withBundleAnalyzer(nextConfig)
