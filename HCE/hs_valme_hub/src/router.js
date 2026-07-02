/**
 * Hash router + module registry.
 *
 * Keeps the loaded base in memory while switching modules.
 * Works on GitHub Pages without server rewrites.
 */

const DEFAULT_ROUTE = 'home';

function createRouter() {
  const registry = new Map();
  let appRoot = null;
  let currentModule = null;
  let titleBase = 'Hub Clinico HS Valme';

  function parseHash() {
    const raw = window.location.hash || `#${DEFAULT_ROUTE}`;
    return raw.replace(/^#\/?/, '').split('/')[0] || DEFAULT_ROUTE;
  }

  function renderRoute() {
    const id = parseHash();
    const module = registry.get(id) || registry.get(DEFAULT_ROUTE);
    if (!module) return;

    if (currentModule && typeof currentModule.teardown === 'function') {
      currentModule.teardown();
    }

    appRoot.innerHTML = '';
    currentModule = module;

    if (module.title) {
      document.title = `${module.title} | ${titleBase}`;
    } else {
      document.title = titleBase;
    }

    module.render(appRoot);
    updateActiveNav(id);
  }

  function updateActiveNav(activeId) {
    document.querySelectorAll('[data-route]').forEach(el => {
      const route = el.getAttribute('data-route');
      el.classList.toggle('active', route === activeId);
    });
  }

  return {
    register(id, module) {
      registry.set(id, module);
      return this;
    },

    mount(root) {
      appRoot = root;
      window.addEventListener('hashchange', renderRoute);
      renderRoute();
      return this;
    },

    navigate(id) {
      window.location.hash = `#${id}`;
    },

    current() {
      return parseHash();
    },

    setTitleBase(text) {
      titleBase = text;
    },

    getRegisteredIds() {
      return Array.from(registry.keys());
    }
  };
}

if (typeof window !== 'undefined') {
  window.ValmeHS = window.ValmeHS || {};
  window.ValmeHS.router = createRouter();
}

export const router = (typeof window !== 'undefined' && window.ValmeHS && window.ValmeHS.router) || createRouter();
