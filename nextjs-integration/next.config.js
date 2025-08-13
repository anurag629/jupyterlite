/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features needed for JupyterLite integration
  experimental: {
    // Add any experimental features if needed
  },

  // Configure webpack for JupyterLite assets
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Don't run webpack on the server for JupyterLite assets
    if (isServer) {
      return config;
    }

    // Add support for loading JupyterLite assets
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Handle dynamic imports for JupyterLite modules
    config.module.rules.push({
      test: /jupyterlite.*\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-syntax-dynamic-import'],
        },
      },
    });

    // Configure module federation for JupyterLite extensions
    config.externals = config.externals || {};
    config.externals['localforage'] = 'localforage';

    // Ensure proper handling of ES modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };

    return config;
  },

  // Configure public path for static assets
  assetPrefix: process.env.NODE_ENV === 'production' ? '/static' : '',

  // Configure static file serving (assets are now local)
  async rewrites() {
    return [
      // All JupyterLite assets are now served from public/ directory
      // No external proxying needed
    ];
  },

  // Configure headers for proper CORS and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Enable SharedArrayBuffer for WebAssembly
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      // Specific headers for JupyterLite assets
      {
        source: '/build/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Configure environment variables
  env: {
    JUPYTER_LITE_BASE_URL: process.env.JUPYTER_LITE_BASE_URL || '/',
    JUPYTER_LITE_WS_URL: process.env.JUPYTER_LITE_WS_URL || 'ws://localhost:3000',
  },

  // Configure image domains if you serve images through Next.js
  images: {
    domains: ['localhost'],
    unoptimized: true, // Disable image optimization for JupyterLite assets
  },

  // Configure trailing slash behavior
  trailingSlash: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Configure build output
  output: 'standalone',

  // Configure compression
  compress: true,

  // Configure redirects if needed
  async redirects() {
    return [
      {
        source: '/',
        destination: '/lab',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;