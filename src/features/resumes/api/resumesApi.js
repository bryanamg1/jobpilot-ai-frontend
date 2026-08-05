import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchResumes() {
  return fetchJson('/resumes');
}

export function uploadResume(payload) {
  return fetchJson('/resumes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function assignResumeToJob({ jobId, resumeId }) {
  return fetchJson(`/jobs/${jobId}/select-resume`, {
    method: 'POST',
    body: JSON.stringify({ resumeId }),
  });
}
