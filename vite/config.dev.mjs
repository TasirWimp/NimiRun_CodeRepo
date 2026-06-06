import { defineConfig } from 'vite';
import { createRouteProposalMiddleware } from '../server/routeProposalRelay.js';

export default defineConfig({
    base: './',
    plugins: [
        {
            name: 'nimirun-route-proposal-relay',
            configureServer(server) {
                server.middlewares.use(createRouteProposalMiddleware());
            },
        },
    ],
    server: {
        port: 8080,
    },
});
