/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ['mongoose'],
    },
    images: {
      domains: ['lh3.googleusercontent.com'],
    },
    webpack(config, { isServer }) {
      if (!isServer) {
        config.resolve.fallback = {
          fs: false,
          path: false,
          puppeteer: require.resolve('puppeteer-core'),
        };
      }
      
      config.module.rules.push({
        test: /\.map$/,
        use: 'ignore-loader', // Ignore source maps
      });
  
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      };
  
      return config;
    },
  };
  
  module.exports = nextConfig;
  