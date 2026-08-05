import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchProfile() {
  return fetchJson('/profile');
}

export function updateProfile(payload) {
  return fetchJson('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
