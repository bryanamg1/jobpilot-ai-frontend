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

export function createDraftPreview(jobId) {
  return fetchJson(`/jobs/${jobId}/draft-preview`, {
    method: 'POST',
  });
}

export function createJobDryRunApplication(jobId) {
  return fetchJson(`/jobs/${jobId}/dry-run-application`, {
    method: 'POST',
  });
}

export function approveJob(jobId, payload = {}) {
  return fetchJson(`/jobs/${jobId}/approve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function rejectJob(jobId, payload = {}) {
  return fetchJson(`/jobs/${jobId}/reject`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
