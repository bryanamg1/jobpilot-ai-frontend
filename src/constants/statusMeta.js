export const statusMeta = {
  READY_TO_PREPARE: { label: 'Lista para preparar', tone: 'good' },
  AWAITING_APPROVAL: { label: 'En revision humana', tone: 'warn' },
  APPROVED: { label: 'Aprobada manualmente', tone: 'good' },
  REJECTED: { label: 'Descartada manualmente', tone: 'bad' },
  REJECTED_BY_RULES: { label: 'Bloqueada por reglas', tone: 'bad' },
  ANALYZED: { label: 'Analizada', tone: 'neutral' },
};

export const recommendationMeta = {
  RECOMMENDED: 'Recomendada',
  REVIEW: 'Revisar',
  CONDITIONAL: 'Condicional',
  DISCARD: 'Descartar',
};

export const previewStatusMeta = {
  READY: { label: 'Listo para revisar', tone: 'good' },
  REVIEW_REQUIRED: { label: 'Requiere revision humana', tone: 'warn' },
  BLOCKED: { label: 'No debe prepararse', tone: 'bad' },
};

export const applicationStatusMeta = {
  SCHEDULE_TRIGGERED: { label: 'Ejecucion iniciada', tone: 'neutral' },
  DISCOVERED: { label: 'Descubierta', tone: 'neutral' },
  DEDUPLICATING: { label: 'Validando duplicados', tone: 'neutral' },
  ELIGIBILITY_CHECK: { label: 'Validando elegibilidad', tone: 'neutral' },
  PREPARING_APPLICATION: { label: 'Preparando postulacion', tone: 'neutral' },
  READY_TO_SUBMIT: { label: 'Lista para revisar', tone: 'good' },
  VERIFYING: { label: 'Registrando evidencia', tone: 'neutral' },
  AWAITING_APPROVAL: { label: 'Esperando aprobacion', tone: 'warn' },
  BLOCKED_BY_CONFIGURATION: { label: 'Bloqueada por configuracion', tone: 'bad' },
  BLOCKED_BY_SOURCE_POLICY: { label: 'Bloqueada por politica de fuente', tone: 'bad' },
  REJECTED_BY_RULES: { label: 'Rechazada por reglas', tone: 'bad' },
  COMPLETED: { label: 'Completada', tone: 'good' },
  FAILED: { label: 'Con error', tone: 'bad' },
};

export const applicationResultMeta = {
  COMPLETED: 'Completada',
  DUPLICATE: 'Duplicada',
  RECIPIENT_MISSING: 'Sin correo visible',
  AWAITING_APPROVAL: 'En espera de aprobacion',
  BLOCKED_BY_SOURCE_POLICY: 'Bloqueada por politica de fuente',
  BLOCKED_BY_CONFIGURATION: 'Bloqueada por configuracion',
  REJECTED_BY_RULES: 'Rechazada por reglas',
};

export const agentRunStatusMeta = {
  STARTED: { label: 'En curso', tone: 'neutral' },
  SKIPPED: { label: 'Omitida', tone: 'warn' },
  COMPLETED: { label: 'Completada', tone: 'good' },
  FAILED: { label: 'Con error', tone: 'bad' },
};

export const agentRunModeMeta = {
  MANUAL: 'Manual',
  ASSISTED: 'Asistido',
  AUTOMATIC: 'Automatico',
  DRY_RUN: 'Simulacion DRY_RUN',
};

export const sourcePolicyMeta = {
  MANUAL_ONLY: 'Solo manual',
  AUTO_DISCOVER: 'Descubrimiento asistido',
  AUTO_PREPARE: 'Preparacion automatica con revision',
  AUTO_FILL: 'Autocompletado asistido',
  AUTO_SUBMIT_ALLOWED: 'Envio permitido con aprobacion',
};

export const sourceTypeMeta = {
  MANUAL: 'Manual',
  LINKEDIN_JOBS_SUPERVISED: 'LinkedIn Jobs supervisado',
  LINKEDIN_FEED_SUPERVISED: 'LinkedIn Feed supervisado',
  LINKEDIN_POST_SEARCH_SUPERVISED: 'LinkedIn Post Search supervisado',
  AUTOMATION: 'Automatizacion',
};

export const approvalStatusMeta = {
  PENDING: { label: 'Pendiente', tone: 'warn' },
  APPROVED: { label: 'Aprobada', tone: 'good' },
  REJECTED: { label: 'Rechazada', tone: 'bad' },
};

export const approvalKindMeta = {
  salaryExpectation: 'Salario',
  englishLevel: 'Nivel de ingles',
  availability: 'Disponibilidad',
  availabilityImmediate: 'Disponibilidad inmediata',
  workAuthorization: 'Autorizacion laboral',
  relocation: 'Reubicacion',
  travel: 'Viajes',
  location: 'Ubicacion',
  legalQuestions: 'Preguntas legales',
  custom: 'Personalizada',
};

export const guardrailFieldMeta = {
  salary: 'Salario',
  englishLevel: 'Nivel de ingles',
  englishRequirement: 'Requisito de ingles',
  availability: 'Disponibilidad',
  availabilityImmediate: 'Disponibilidad inmediata',
  workAuthorization: 'Autorizacion laboral',
  relocation: 'Reubicacion',
  travel: 'Viajes',
  location: 'Ubicacion',
  legalQuestions: 'Preguntas legales',
  technologyClaims: 'Tecnologias no verificadas',
  yearsOfExperience: 'Anos de experiencia',
};

export const answerKindMeta = {
  salaryExpectation: 'Salario',
  englishLevel: 'Nivel de ingles',
  availability: 'Disponibilidad',
  workAuthorization: 'Autorizacion laboral',
  relocation: 'Reubicacion',
  travel: 'Viajes',
  location: 'Ubicacion',
  legalQuestions: 'Preguntas legales',
  custom: 'Personalizada',
};

export const certaintyMeta = {
  CONFIRMED: 'Confirmado',
  INFERRED: 'Inferido',
  REQUIRES_APPROVAL: 'Requiere aprobacion',
  UNKNOWN: 'Desconocido',
  PROHIBITED: 'Prohibido',
};

export const usageStatusMeta = {
  REFERENCE_ONLY: { label: 'Referencia segura', tone: 'good' },
  REVIEW_REQUIRED: { label: 'Revisar manualmente', tone: 'warn' },
  DO_NOT_USE: { label: 'No usar', tone: 'bad' },
};

export const factFieldMeta = {
  technology: 'Tecnologia',
  project: 'Proyecto',
  targetRole: 'Rol objetivo',
  company: 'Empresa',
};

export const healthStatusMeta = {
  ok: 'Operativo',
  configured: 'Configurado',
  connected: 'Conectado',
  disconnected: 'No conectado',
  disabled: 'Deshabilitado',
  error: 'Con error',
  degraded: 'Degradado',
  closed: 'Cerrado',
  open: 'Abierto',
  half_open: 'Semiabierto',
};

export const storageModeMeta = {
  memory: 'Memoria',
  mysql: 'MySQL',
};

export const queueModeMeta = {
  inline: 'En linea',
  bullmq: 'BullMQ',
  redis: 'Redis',
};

export const integrationStatusMeta = {
  configured: 'Configurado',
  connected: 'Conectado',
  disabled: 'Deshabilitado',
  error: 'Con error',
  missing: 'Falta configuracion',
  disconnected: 'No conectado',
};

export const circuitStateMeta = {
  closed: 'Cerrado',
  open: 'Abierto',
  half_open: 'Semiabierto',
};

export const answerKindOptions = [
  'salaryExpectation',
  'englishLevel',
  'availability',
  'workAuthorization',
  'relocation',
  'travel',
  'location',
  'legalQuestions',
  'custom',
];

export const certaintyOptions = [
  'CONFIRMED',
  'INFERRED',
  'REQUIRES_APPROVAL',
  'UNKNOWN',
  'PROHIBITED',
];

export const approvalKindOptions = [
  'salaryExpectation',
  'englishLevel',
  'availability',
  'workAuthorization',
  'relocation',
  'travel',
];

export const approvalStatusOptions = ['PENDING', 'APPROVED', 'REJECTED'];

export function getMeta(map, key, fallback = null) {
  if (key && map[key]) {
    return map[key];
  }
  if (fallback && map[fallback]) {
    return map[fallback];
  }
  return { label: key ?? 'Sin datos', tone: 'neutral' };
}

export function getLabel(map, key, fallback = 'Sin datos') {
  if (key && map[key]) {
    const value = map[key];
    return typeof value === 'string' ? value : value.label;
  }
  return fallback;
}

export function mapCertaintyToUsageStatus(certainty) {
  if (certainty === 'CONFIRMED' || certainty === 'INFERRED') {
    return 'REFERENCE_ONLY';
  }
  if (certainty === 'REQUIRES_APPROVAL') {
    return 'REVIEW_REQUIRED';
  }
  return 'DO_NOT_USE';
}

export function formatRunSummary(summary) {
  if (!summary) {
    return 'Sin resumen disponible.';
  }

  if (summary.reason) {
    return summary.reason;
  }

  if (summary.error) {
    return `Error: ${summary.error}`;
  }

  const parts = [];
  if (summary.total != null) {
    parts.push(`Total: ${summary.total}`);
  }
  if (summary.completed != null) {
    parts.push(`Completadas: ${summary.completed}`);
  }
  if (summary.awaitingApproval != null) {
    parts.push(`Con aprobacion pendiente: ${summary.awaitingApproval}`);
  }
  if (summary.blockedByPolicy != null) {
    parts.push(`Bloqueadas por politica: ${summary.blockedByPolicy}`);
  }
  if (summary.rejectedByRules != null) {
    parts.push(`Rechazadas por reglas: ${summary.rejectedByRules}`);
  }

  return parts.join(' | ') || 'Sin resumen disponible.';
}
