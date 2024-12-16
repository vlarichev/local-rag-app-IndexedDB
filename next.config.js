/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
        fs: false,
        path: false,
        crypto: false,
        os: false,
      };
    }
    
    // Exclude ONNX Runtime native modules from webpack bundling
    config.externals = [...(config.externals || []), { 'onnxruntime-node': 'onnxruntime-node' }];

    // Ignore .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
}

module.exports = nextConfig
