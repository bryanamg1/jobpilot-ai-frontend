import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchHealthStatus() {
  return fetchJson('/health');
}
