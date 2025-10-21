/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    
    // Add pdfjs-dist to transpile modules
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
}

module.exports = nextConfig

