import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchDashboard() {
  return fetchJson('/dashboard');
}
