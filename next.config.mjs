/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
      
      // Exclude MongoDB and related packages from client bundle
      config.externals = config.externals || []
      config.externals.push({
        'mongodb': 'commonjs mongodb',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        'bcryptjs': 'commonjs bcryptjs',
        'jsonwebtoken': 'commonjs jsonwebtoken',
      })
    }
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['mongodb', '@mongodb-js/zstd', 'bcryptjs', 'jsonwebtoken']
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
