/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: '../ui',
    basePath: '/api-tester',
    assetPrefix: '/api-tester',
    images: {
        unoptimized: true
    }
}

module.exports = nextConfig
