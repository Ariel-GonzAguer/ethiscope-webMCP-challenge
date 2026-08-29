export type MarcoId = 'euaia' | 'nist';

export type EstadoCriterio = 'pending' | 'draft' | 'approved' | 'rejected';

export type Rating = 'conforming' | 'partial' | 'non-conforming';

export interface Criterio {
  id: string;
  marco: MarcoId;
  categoria: string;
  titulo: string;
  descripcion: string;
}

export interface Evidencia {
  text: string | null;
  url: string | null;
}

export interface EvaluacionCriterio {
  criterioId: string;
  estado: EstadoCriterio;
  rating: Rating | null;
  /** Borrador escrito por el agente (o el humano), pendiente de revisión. */
  draft: string | null;
  evidencia: Evidencia[];
  /** Texto aprobado que entra en el reporte final. */
  versionFinal: string | null;
}

export interface EntradaLog {
  id: string;
  actor: 'agent' | 'human';
  tool: string | null;
  message: string;
  timestamp: number;
}

export interface EstadoAuditoria {
  sistemaNombre: string;
  descripcionSistema: string;
  evaluaciones: Record<string, EvaluacionCriterio>;
  log: EntradaLog[];
}

export interface AccionesAuditoria {
  setSistemaNombre: (nombre: string) => void;
  setDescripcionSistema: (descripcion: string) => void;
  guardarBorrador: (
    criterioId: string,
    texto: string,
    rating: Rating,
    actor: 'agent' | 'human',
    tool: string | null,
  ) => void;
  agregarEvidencia: (
    criterioId: string,
    evidencia: Evidencia,
    actor: 'agent' | 'human',
    tool: string | null,
  ) => void;
  aprobarCriterio: (criterioId: string, actor: 'agent' | 'human') => void;
  rechazarCriterio: (criterioId: string, actor: 'agent' | 'human') => void;
  reiniciarAuditoria: () => void;
}
