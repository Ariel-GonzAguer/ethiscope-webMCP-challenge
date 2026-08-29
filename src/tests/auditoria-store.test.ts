import { beforeEach, describe, expect, it } from 'vitest';
import { useAuditoriaStore, compilarReporte } from '../store/auditoria';
import { CRITERIOS } from '../datos/marcos';

describe('store de auditoría', () => {
  beforeEach(() => {
    useAuditoriaStore.getState().reiniciarAuditoria();
  });

  it('inicia con todos los criterios en pending', () => {
    const estado = useAuditoriaStore.getState();
    expect(Object.keys(estado.evaluaciones)).toHaveLength(CRITERIOS.length);
    for (const evaluacion of Object.values(estado.evaluaciones)) {
      expect(evaluacion.estado).toBe('pending');
    }
  });

  it('guardarBorrador pone el criterio en draft con rating', () => {
    useAuditoriaStore
      .getState()
      .guardarBorrador('euaia-transparency', 'The system shows a disclosure banner.', 'partial', 'agent', 'draft_assessment');

    const evaluacion = useAuditoriaStore.getState().evaluaciones['euaia-transparency'];
    expect(evaluacion?.estado).toBe('draft');
    expect(evaluacion?.rating).toBe('partial');
    expect(evaluacion?.draft).toContain('disclosure banner');
  });

  it('aprobar sin borrador no cambia el estado', () => {
    useAuditoriaStore.getState().aprobarCriterio('euaia-transparency', 'human');
    expect(useAuditoriaStore.getState().evaluaciones['euaia-transparency']?.estado).toBe('pending');
  });

  it('aprobar un draft lo incluye en el reporte final', () => {
    const { guardarBorrador, aprobarCriterio } = useAuditoriaStore.getState();
    guardarBorrador('euaia-transparency', 'Approved text.', 'conforming', 'agent', 'draft_assessment');
    aprobarCriterio('euaia-transparency', 'human');

    const evaluacion = useAuditoriaStore.getState().evaluaciones['euaia-transparency'];
    expect(evaluacion?.estado).toBe('approved');
    expect(evaluacion?.versionFinal).toBe('Approved text.');

    const reporte = compilarReporte(useAuditoriaStore.getState());
    expect(reporte).toContain('Approved text.');
  });

  it('rechazar un draft lo saca del flujo', () => {
    const { guardarBorrador, rechazarCriterio } = useAuditoriaStore.getState();
    guardarBorrador('nist-map-context', 'Bad draft.', 'non-conforming', 'agent', 'draft_assessment');
    rechazarCriterio('nist-map-context', 'human');

    expect(useAuditoriaStore.getState().evaluaciones['nist-map-context']?.estado).toBe('rejected');
    const reporte = compilarReporte(useAuditoriaStore.getState());
    expect(reporte).not.toContain('Bad draft.');
  });

  it('agregarEvidencia acumula evidencia por criterio', () => {
    useAuditoriaStore
      .getState()
      .agregarEvidencia('euaia-logging', { url: 'https://example.com/logs', text: null }, 'agent', 'add_evidence');

    const evidencia = useAuditoriaStore.getState().evaluaciones['euaia-logging']?.evidencia;
    expect(evidencia).toHaveLength(1);
    expect(evidencia?.[0]?.url).toBe('https://example.com/logs');
  });

  it('el log registra actor y tool', () => {
    useAuditoriaStore
      .getState()
      .guardarBorrador('euaia-transparency', 'x', 'partial', 'agent', 'draft_assessment');

    const entrada = useAuditoriaStore.getState().log[0];
    expect(entrada?.actor).toBe('agent');
    expect(entrada?.tool).toBe('draft_assessment');
  });
});

describe('compilarReporte', () => {
  beforeEach(() => {
    useAuditoriaStore.getState().reiniciarAuditoria();
  });

  it('solo incluye criterios aprobados por un humano', () => {
    const { guardarBorrador, aprobarCriterio } = useAuditoriaStore.getState();

    guardarBorrador('euaia-transparency', 'Included.', 'conforming', 'agent', 'draft_assessment');
    guardarBorrador('nist-map-context', 'NOT included — still draft.', 'partial', 'agent', 'draft_assessment');
    aprobarCriterio('euaia-transparency', 'human');

    const reporte = compilarReporte(useAuditoriaStore.getState());
    expect(reporte).toContain('Included.');
    expect(reporte).not.toContain('NOT included');
  });

  it('incluye el nombre del sistema y el conteo de aprobados', () => {
    useAuditoriaStore.getState().setSistemaNombre('Support Chatbot');
    useAuditoriaStore.getState().guardarBorrador('euaia-transparency', 'Text.', 'conforming', 'agent', 'draft_assessment');
    useAuditoriaStore.getState().aprobarCriterio('euaia-transparency', 'human');

    const reporte = compilarReporte(useAuditoriaStore.getState());
    expect(reporte).toContain('Support Chatbot');
    expect(reporte).toContain('1 criteria approved');
  });

  it('reporte vacío sin aprobaciones', () => {
    const reporte = compilarReporte(useAuditoriaStore.getState());
    expect(reporte).toContain('0 criteria approved');
    expect(reporte).not.toContain('##');
  });
});
