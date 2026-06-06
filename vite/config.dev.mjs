import { defineConfig, loadEnv } from 'vite';
import { createRouteProposalMiddleware } from '../server/routeProposalRelay.js';

export default defineConfig(({ mode }) => {
    const fileEnv = loadEnv(mode, process.cwd(), '');
    const relayEnv = { ...fileEnv, ...process.env };

    return {
        base: './',
        plugins: [
            {
                name: 'nimirun-route-proposal-relay',
                configureServer(server) {
                    server.middlewares.use(createRouteProposalMiddleware({ env: relayEnv }));
                },
            },
        ],
        server: {
            port: 8080,
        },
    };
});
