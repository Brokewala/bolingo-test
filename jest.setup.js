import "@testing-library/jest-dom";

/** Mock sessionStorage pour les tests d'authentification. */
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

beforeEach(() => {
  window.sessionStorage.clear();
  jest.clearAllMocks();
});
