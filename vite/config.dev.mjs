import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    plugins: [
        {
            name: 'log-resolved-paths',
            resolveId(source) {
                console.log('Resolving:', source);
                return null; // Let Vite handle the resolution
            },
        },
    ],
    server: {
        port: 8080,
    },
});

