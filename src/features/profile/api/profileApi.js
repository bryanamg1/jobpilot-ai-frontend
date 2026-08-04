import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchProfile() {
  return fetchJson('/profile');
}
