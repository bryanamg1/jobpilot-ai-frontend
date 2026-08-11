import { ApiError, ApiUnavailableError } from './fetchJson.js';
import { dashboardText } from '../../constants/dashboardText.js';

export function normalizeAppError(error, options = {}) {
  const common = dashboardText.common;

  if (!error) {
    return {
      title: options.fallbackTitle ?? common.genericErrorTitle,
      message: common.noDataAvailable,
      cause: null,
      action: options.fallbackAction ?? common.genericErrorAction,
      retryable: Boolean(options.onRetry),
    };
  }

  if (error instanceof ApiUnavailableError) {
    return {
      title: common.apiOfflineTitle,
      message: error.message,
      cause: `No hubo respuesta desde ${error.apiBaseUrl}.`,
      action: options.fallbackAction ?? common.apiOfflineAction,
      retryable: Boolean(options.onRetry),
    };
  }

  if (error instanceof ApiError) {
    const payload = error.payload ?? {};
    const cause = payload.cause ?? collectValidationCause(payload);
    const action = payload.action ?? deriveActionFromApiError(error);

    return {
      title: payload.title ?? deriveTitleFromApiError(error),
      message: payload.message ?? error.message ?? common.genericErrorTitle,
      cause,
      action,
      retryable: Boolean(options.onRetry) && isRetryableApiError(error),
    };
  }

  return {
    title: options.fallbackTitle ?? common.genericErrorTitle,
    message: error.message ?? common.genericErrorTitle,
    cause: null,
    action: options.fallbackAction ?? common.genericErrorAction,
    retryable: Boolean(options.onRetry),
  };
}

function deriveTitleFromApiError(error) {
  const common = dashboardText.common;

  if (error.code === 'VALIDATION_ERROR') {
    return common.validationErrorTitle;
  }

  if (error.code === 'AUTOMATION_MODE_UNAVAILABLE') {
    return common.automationModeConflictTitle;
  }

  if (error.status === 408 || error.status === 504) {
    return common.timeoutErrorTitle;
  }

  if (error.status === 409) {
    return 'La configuracion entro en conflicto.';
  }

  if (error.status >= 500) {
    return 'El backend devolvio un error inesperado.';
  }

  return common.genericErrorTitle;
}

function deriveActionFromApiError(error) {
  const common = dashboardText.common;

  if (error.code === 'VALIDATION_ERROR') {
    return common.validationErrorAction;
  }

  if (error.code === 'AUTOMATION_MODE_UNAVAILABLE') {
    return common.automationModeConflictAction;
  }

  if (error.status === 408 || error.status === 504) {
    return common.timeoutErrorAction;
  }

  if (error.status >= 500) {
    return 'Revisa el estado del backend y vuelve a intentar.';
  }

  return common.genericErrorAction;
}

function collectValidationCause(payload) {
  if (!Array.isArray(payload.errors) || !payload.errors.length) {
    return null;
  }

  return payload.errors.map((item) => item?.message).filter(Boolean).join(' ');
}

function isRetryableApiError(error) {
  if (error.code === 'VALIDATION_ERROR') {
    return false;
  }

  return error.status >= 500 || error.status === 408 || error.status === 409;
}
