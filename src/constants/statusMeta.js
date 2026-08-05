export const statusMeta = {
  READY_TO_PREPARE: { label: 'Lista para preparar', tone: 'good' },
  AWAITING_APPROVAL: { label: 'En revision humana', tone: 'warn' },
  REJECTED_BY_RULES: { label: 'Bloqueada por reglas', tone: 'bad' },
  ANALYZED: { label: 'Analizada', tone: 'neutral' },
};

export const recommendationMeta = {
  RECOMMENDED: 'Recomendada',
  REVIEW: 'Revisar',
  CONDITIONAL: 'Condicional',
  DISCARD: 'Descartar',
};
