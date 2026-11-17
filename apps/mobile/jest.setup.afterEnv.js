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


// T11.04: TanStack stale/gc timers can be scheduled by a query that settles
// after its test ended. Unref them so they never keep the Jest process alive.
try {
  const { timeoutManager } = require('@tanstack/query-core');
  const unref = (t) => {
    if (t && typeof t.unref === 'function') t.unref();
    return t;
  };
  timeoutManager.setTimeoutProvider({
    setTimeout: (cb, ms) => unref(setTimeout(cb, ms)),
    clearTimeout: (id) => clearTimeout(id),
    setInterval: (cb, ms) => unref(setInterval(cb, ms)),
    clearInterval: (id) => clearInterval(id),
  });
} catch (_) {}
