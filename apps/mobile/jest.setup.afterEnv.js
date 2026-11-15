/* global afterEach */
// T09.70: Clean up TanStack Query to prevent open handles after tests
const tanstackReactQuery = require('@tanstack/react-query');
const OriginalQueryClient = tanstackReactQuery.QueryClient;
const activeQueryClients = new Set();

tanstackReactQuery.notifyManager.setScheduler((cb) => cb());

class ManagedQueryClient extends OriginalQueryClient {
  constructor(config) {
    super({
      ...config,
      defaultOptions: {
        ...config?.defaultOptions,
        queries: {
          gcTime: Infinity,
          ...config?.defaultOptions?.queries,
        },
        mutations: {
          gcTime: Infinity,
          ...config?.defaultOptions?.mutations,
        },
      },
    });
    activeQueryClients.add(this);
  }
}

tanstackReactQuery.QueryClient = ManagedQueryClient;
try {
  const tanstackQueryCore = require('@tanstack/query-core');
  tanstackQueryCore.QueryClient = ManagedQueryClient;
  tanstackQueryCore.notifyManager.setScheduler((cb) => cb());
} catch (_) {}

afterEach(() => {
  activeQueryClients.forEach((client) => {
    try {
      client.clear();
    } catch (_) {}
  });
  activeQueryClients.clear();

  try {
    const { queryClient } = require('./src/lib/queryClient');
    queryClient.clear();
  } catch (_) {}
});

