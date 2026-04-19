/**
 * In-memory stub for `@react-native-async-storage/async-storage` on web.
 * WalletConnect / MetaMask resolve this module in browser bundles; we do not use RN storage in chat.
 */
const memory = new Map();

const AsyncStorage = {
  getItem: (key) =>
    Promise.resolve(memory.has(key) ? String(memory.get(key)) : null),
  setItem: (key, value) => {
    memory.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    memory.delete(key);
    return Promise.resolve();
  },
  clear: () => {
    memory.clear();
    return Promise.resolve();
  },
  getAllKeys: () => Promise.resolve([...memory.keys()]),
  multiGet: (keys) =>
    Promise.resolve(keys.map((k) => [k, memory.has(k) ? memory.get(k) : null])),
  multiSet: (pairs) => {
    pairs.forEach(([k, v]) => memory.set(k, v));
    return Promise.resolve();
  },
  multiRemove: (keys) => {
    keys.forEach((k) => memory.delete(k));
    return Promise.resolve();
  },
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
