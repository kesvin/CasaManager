/** @type {import('next').NextConfig} */
import bundleAnalyzerPkg from '@next/bundle-analyzer'

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

export default withBundleAnalyzer(nextConfig)
