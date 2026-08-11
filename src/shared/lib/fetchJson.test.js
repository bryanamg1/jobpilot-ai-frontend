import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, ApiUnavailableError, fetchJson } from './fetchJson.js';
import { getApiConnectionSnapshot, resetApiConnectionState } from './apiConnectionStore.js';

describe('fetchJson', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetApiConnectionState();
  });

  it('returns the JSON payload for successful responses', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { ok: true },
        }),
        { status: 200 },
      ),
    );

    const payload = await fetchJson('/answers');

    expect(payload).toEqual({
      data: { ok: true },
    });
  });

  it('throws ApiError with validation metadata and readable message', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son vÃ¡lidos.',
          errors: [
            { field: 'question', message: 'La pregunta es obligatoria.' },
            { field: 'answer', message: 'La respuesta es obligatoria.' },
          ],
        }),
        { status: 400 },
      ),
    );

    await expect(fetchJson('/answers', { method: 'POST' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION_ERROR',
      errors: [
        { field: 'question', message: 'La pregunta es obligatoria.' },
        { field: 'answer', message: 'La respuesta es obligatoria.' },
      ],
      message: 'La pregunta es obligatoria. La respuesta es obligatoria.',
    });
  });

  it('falls back to the API message for non-validation failures', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Ocurrio un error inesperado en el servidor.',
        }),
        { status: 500 },
      ),
    );

    await expect(fetchJson('/answers')).rejects.toEqual(
      expect.objectContaining({
        name: 'ApiError',
        status: 500,
        message: 'Ocurrio un error inesperado en el servidor.',
      }),
    );
  });

  it('handles invalid JSON error payloads safely', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response('gateway failed', {
        status: 502,
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    );

    await expect(fetchJson('/answers')).rejects.toEqual(
      expect.objectContaining({
        name: 'ApiError',
        status: 502,
        message: 'La solicitud no pudo completarse.',
      }),
    );
  });

  it('exports ApiError for downstream consumers', () => {
    expect(new ApiError({ message: 'boom' }, 500)).toBeInstanceOf(Error);
  });

  it('marks the API as offline and throws ApiUnavailableError on connection failures', async () => {
    globalThis.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchJson('/health')).rejects.toBeInstanceOf(ApiUnavailableError);
    expect(getApiConnectionSnapshot().status).toBe('offline');
  });
});

