/**
 * In-memory shared state for the HS Valme hub.
 *
 * No localStorage, sessionStorage, IndexedDB, or cookies are used.
 * A page reload or tab close clears everything.
 */

function createStore() {
  const state = {
    base: null,
    lastError: null
  };
  const listeners = new Set();

  function publish(eventType, payload) {
    for (const fn of listeners) {
      try {
        fn(eventType, payload);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Store subscriber error:', err);
      }
    }
  }

  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    setBase(payload) {
      state.base = {
        fileName: payload.fileName || '',
        loadedAt: new Date().toISOString(),
        monografica: payload.monografica || [],
        multidisciplinar: payload.multidisciplinar || [],
        counts: {
          monografica: (payload.monografica || []).length,
          multidisciplinar: (payload.multidisciplinar || []).length
        }
      };
      state.lastError = null;
      publish('base-loaded', state.base);
    },

    clearBase() {
      state.base = null;
      state.lastError = null;
      publish('base-cleared', null);
    },

    getBase() {
      return state.base;
    },

    setError(message) {
      state.lastError = message;
      publish('base-error', { message });
    },

    getError() {
      return state.lastError;
    },

    getCounts() {
      if (!state.base) return { monografica: 0, multidisciplinar: 0 };
      return state.base.counts;
    }
  };
}

if (typeof window !== 'undefined') {
  window.ValmeHS = window.ValmeHS || {};
  window.ValmeHS.store = createStore();
}

export const store = (typeof window !== 'undefined' && window.ValmeHS && window.ValmeHS.store) || createStore();
