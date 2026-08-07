import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchAnswers() {
  return fetchJson('/answers');
}

export function createAnswer(payload) {
  return fetchJson('/answers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAnswer({ answerId, payload }) {
  return fetchJson(`/answers/${answerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAnswer(answerId) {
  return fetchJson(`/answers/${answerId}`, {
    method: 'DELETE',
  });
}
