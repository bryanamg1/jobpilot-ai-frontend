import { describe, expect, it } from 'vitest';
import { agentRunModeMeta, applicationResultMeta, getLabel, sourcePolicyMeta } from './statusMeta.js';

describe('statusMeta', () => {
  it('muestra etiquetas visuales en espanol para resultados de postulacion', () => {
    expect(getLabel(applicationResultMeta, 'DUPLICATE')).toBe('Duplicada');
    expect(getLabel(applicationResultMeta, 'AWAITING_APPROVAL')).toBe('En espera de aprobacion');
  });

  it('mapea los modos y politicas de automatizacion a etiquetas legibles', () => {
    expect(getLabel(agentRunModeMeta, 'DRY_RUN')).toBe('Simulacion DRY_RUN');
    expect(getLabel(sourcePolicyMeta, 'AUTO_PREPARE')).toBe('Preparacion automatica con revision');
  });
});
