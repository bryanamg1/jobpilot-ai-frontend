const listeners = new Set();

let state = {
  status: 'unknown',
  lastError: null,
  lastCheckedAt: null,
};

export function subscribeToApiConnection(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getApiConnectionSnapshot() {
  return state;
}

export function markApiOnline() {
  updateState({
    status: 'online',
    lastError: null,
    lastCheckedAt: new Date().toISOString(),
  });
}

export function markApiOffline(error) {
  updateState({
    status: 'offline',
    lastError: error ?? null,
    lastCheckedAt: new Date().toISOString(),
  });
}

export function resetApiConnectionState() {
  state = {
    status: 'unknown',
    lastError: null,
    lastCheckedAt: null,
  };
  emitChange();
}

function updateState(nextValues) {
  state = {
    ...state,
    ...nextValues,
  };
  emitChange();
}

function emitChange() {
  listeners.forEach((listener) => listener());
}
