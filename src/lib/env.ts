/**
 * True when the app runs inside another page's frame (e.g. an embedded preview).
 * Framed hosts usually block printing and script-started downloads, so the UI
 * hides those actions and offers clipboard alternatives instead.
 */
export const isFramed: boolean = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

/** localStorage wrapper that never throws (private mode, blocked storage, quota). */
export const safeStorage: Storage = {
  get length() {
    try {
      return window.localStorage.length;
    } catch {
      return 0;
    }
  },
  key: (i) => {
    try {
      return window.localStorage.key(i);
    } catch {
      return null;
    }
  },
  getItem: (k) => {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* storage unavailable — keep working in memory */
    }
  },
  removeItem: (k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      window.localStorage.clear();
    } catch {
      /* ignore */
    }
  },
};
