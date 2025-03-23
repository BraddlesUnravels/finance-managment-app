import type { NextConfig } from 'next';
// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    /* config options here */
    output: 'standalone',
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.watchOptions = {
                ignored: ['**/.git/**', '**/node_modules/**', '**/.next/**', '**/dist/**'],
                aggregateTimeout: 300, // Delay rebuild after change
                poll: 1000, // Enable polling (useful for WSL, Docker, etc.)
            };
        }
        return config;
    },
};

export default nextConfig;
