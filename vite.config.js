import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'ShopHub — E-commerce',
                short_name: 'ShopHub',
                description: 'Your premium shopping destination',
                theme_color: '#6366f1',
                background_color: '#0f0f1a',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    { src: 'favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
                    { src: 'favicon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\./,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 10,
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/res\.cloudinary\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'cloudinary-images',
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@features': path.resolve(__dirname, './src/features'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@routes': path.resolve(__dirname, './src/routes'),
            '@services': path.resolve(__dirname, './src/services'),
            '@store': path.resolve(__dirname, './src/store'),
            '@types': path.resolve(__dirname, './src/types'),
            '@utils': path.resolve(__dirname, './src/utils'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
