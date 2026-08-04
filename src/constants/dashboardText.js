export const dashboardText = {
  shell: {
    eyebrow: 'JobPilot AI',
    title: 'Pipeline de postulaciones con revisión humana',
    subtitle:
      'Carga una vacante manual, analiza compatibilidad con reglas deterministas y revisa qué datos necesitan aprobación antes de preparar un borrador.',
    storageLabel: 'Modo de almacenamiento',
  },
  metrics: {
    total: 'Vacantes analizadas',
    ready: 'Listas para preparar',
    blocked: 'Bloqueadas por reglas',
  },
  form: {
    title: 'Nueva vacante manual',
    subtitle:
      'Pega texto de una publicación, alerta o correo. El sistema extrae señales visibles y nunca inventa experiencia.',
    rawTextLabel: 'Texto de la vacante',
    rawTextPlaceholder:
      'Ejemplo: Backend Developer - Remote at Acme Labs...\nEmpresa: Acme Labs\nRequisito: Node.js, Express y MySQL...',
    sourceUrlLabel: 'Enlace original',
    sourceUrlPlaceholder: 'https://www.linkedin.com/jobs/view/...',
    submitIdle: 'Analizar vacante',
    submitBusy: 'Analizando...',
    success: 'Vacante analizada y guardada.',
  },
  profile: {
    title: 'Perfil maestro actual',
    targetRoles: 'Roles objetivo',
    location: 'Ubicación',
    english: 'Inglés confirmado',
    availability: 'Disponibilidad',
    salary: 'Salario base',
  },
  list: {
    title: 'Vacantes recientes',
    empty: 'Todavía no hay vacantes cargadas.',
    matches: 'Coincidencias',
    gaps: 'Brechas',
    risks: 'Riesgos',
    approvals: 'Requiere aprobación',
    blocked: 'Bloqueos',
  },
};
