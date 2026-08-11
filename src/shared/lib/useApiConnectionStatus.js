import { useSyncExternalStore } from 'react';
import {
  getApiConnectionSnapshot,
  subscribeToApiConnection,
} from './apiConnectionStore.js';

export function useApiConnectionStatus() {
  return useSyncExternalStore(subscribeToApiConnection, getApiConnectionSnapshot, getApiConnectionSnapshot);
}
