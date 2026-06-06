import { createRouteProposalFetchHandler } from '../server/routeProposalRelay.js';

export default {
  fetch(request) {
    return createRouteProposalFetchHandler({ env: process.env })(request);
  },
};
