import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchJobs() {
  return fetchJson('/jobs');
}

export function createManualJob(payload) {
  return fetchJson('/jobs/manual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
