export function getApiValidationMessages(error) {
  if (!Array.isArray(error?.errors) || !error.errors.length) {
    return [];
  }

  return [...new Set(error.errors.map((item) => item?.message).filter(Boolean))];
}

export function applyApiFieldErrors(error, setError, fieldMap = {}) {
  if (!Array.isArray(error?.errors) || !error.errors.length) {
    return false;
  }

  let applied = false;

  for (const item of error.errors) {
    const field = fieldMap[item?.field] ?? item?.field;
    if (!field || !item?.message) {
      continue;
    }

    setError(field, {
      type: 'server',
      message: item.message,
    });
    applied = true;
  }

  return applied;
}
