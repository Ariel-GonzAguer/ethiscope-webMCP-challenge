import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccionesAuditoria, EstadoAuditoria } from '../tipos/dominio';
import { CRITERIOS } from '../datos/marcos';

const CLAVE_ALMACEN = 'ethiscope-auditoria-v1';

function generarId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function evaluacionesIniciales(): EstadoAuditoria['evaluaciones'] {
  const evaluaciones: EstadoAuditoria['evaluaciones'] = {};
  for (const criterio of CRITERIOS) {
    evaluaciones[criterio.id] = {
      criterioId: criterio.id,
      estado: 'pending',
      rating: null,
      draft: null,
      evidencia: [],
      versionFinal: null,
    };
  }
  return evaluaciones;
}

function estadoInicial(): EstadoAuditoria {
  return {
    sistemaNombre: 'Untitled AI system',
    descripcionSistema: '',
    evaluaciones: evaluacionesIniciales(),
    log: [],
  };
}

export const useAuditoriaStore = create<EstadoAuditoria & AccionesAuditoria>()(
  persist(
    (set) => ({
      ...estadoInicial(),

      setSistemaNombre: (nombre) => set({ sistemaNombre: nombre }),

      setDescripcionSistema: (descripcion) => set({ descripcionSistema: descripcion }),

      guardarBorrador: (criterioId, texto, rating, actor, tool) => {
        set((estado) => {
          const actual = estado.evaluaciones[criterioId];
          if (!actual) return estado;
          return {
            evaluaciones: {
              ...estado.evaluaciones,
              [criterioId]: {
                ...actual,
                draft: texto,
                rating,
                estado: 'draft',
              },
            },
            log: [
              ...estado.log,
              {
                id: generarId(),
                actor,
                tool,
                message: `Draft saved for ${criterioId} (${rating}). Pending human review.`,
                timestamp: Date.now(),
              },
            ],
          };
        });
      },

      agregarEvidencia: (criterioId, evidencia, actor, tool) => {
        set((estado) => {
          const actual = estado.evaluaciones[criterioId];
          if (!actual) return estado;
          return {
            evaluaciones: {
              ...estado.evaluaciones,
              [criterioId]: {
                ...actual,
                evidencia: [...actual.evidencia, evidencia],
              },
            },
            log: [
              ...estado.log,
              {
                id: generarId(),
                actor,
                tool,
                message: `Evidence added to ${criterioId}: ${evidencia.url ?? evidencia.text?.slice(0, 80) ?? ''}`,
                timestamp: Date.now(),
              },
            ],
          };
        });
      },

      aprobarCriterio: (criterioId, actor) => {
        set((estado) => {
          const actual = estado.evaluaciones[criterioId];
          if (!actual) return estado;
          if (actual.draft === null) return estado;
          return {
            evaluaciones: {
              ...estado.evaluaciones,
              [criterioId]: {
                ...actual,
                estado: 'approved',
                versionFinal: actual.draft,
              },
            },
            log: [
              ...estado.log,
              {
                id: generarId(),
                actor,
                tool: null,
                message: `${criterioId} approved and included in the report.`,
                timestamp: Date.now(),
              },
            ],
          };
        });
      },

      rechazarCriterio: (criterioId, actor) => {
        set((estado) => {
          const actual = estado.evaluaciones[criterioId];
          if (!actual) return estado;
          return {
            evaluaciones: {
              ...estado.evaluaciones,
              [criterioId]: {
                ...actual,
                estado: 'rejected',
              },
            },
            log: [
              ...estado.log,
              {
                id: generarId(),
                actor,
                tool: null,
                message: `${criterioId} rejected. The agent can draft a new version.`,
                timestamp: Date.now(),
              },
            ],
          };
        });
      },

      reiniciarAuditoria: () => set(estadoInicial()),
    }),
    {
      name: CLAVE_ALMACEN,
    },
  ),
);

/**
 * Compila el reporte final en markdown usando SOLO criterios aprobados.
 * Esta es la garantía central de EthiScope: nada entra sin aprobación humana.
 */
export function compilarReporte(estado: EstadoAuditoria): string {
  const aprobados = CRITERIOS.filter(
    (criterio) => estado.evaluaciones[criterio.id]?.estado === 'approved',
  );

  const secciones = aprobados
    .map((criterio) => {
      const evaluacion = estado.evaluaciones[criterio.id];
      if (!evaluacion || evaluacion.versionFinal === null) return null;

      const evidencias = evaluacion.evidencia
        .map((evidencia) => {
          if (evidencia.url) return `- [Evidence] ${evidencia.url}`;
          if (evidencia.text) return `- Evidence: ${evidencia.text}`;
          return null;
        })
        .filter((linea): linea is string => linea !== null);

      return `## ${criterio.categoria} — ${criterio.titulo}\n\nRating: **${evaluacion.rating ?? 'n/a'}**\n\n${evaluacion.versionFinal}\n\n${evidencias.length > 0 ? `${evidencias.join('\n')}\n` : ''}`;
    })
    .filter((seccion): seccion is string => seccion !== null);

  const encabezado = `# AI Ethics Audit Report — ${estado.sistemaNombre}\n\n${estado.descripcionSistema ? `${estado.descripcionSistema}\n` : ''}*${aprobados.length} criteria approved by a human reviewer.*\n`;

  return [encabezado, ...secciones].join('\n');
}
