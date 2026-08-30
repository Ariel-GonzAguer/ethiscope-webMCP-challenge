/* eslint-disable @typescript-eslint/require-await --
   La API de WebMCP exige que los handlers `execute` sean `async` aunque el
   motor de reglas sea síncrono. El contrato externo (browser/agent) asume
   `Promise<unknown>` como tipo de retorno. */

import { useAuditoriaStore, compilarReporte } from '../store/auditoria';
import { CRITERIOS, MARCOS, buscarCriterio } from '../datos/marcos';
import type { Rating } from '../tipos/dominio';

const RATINGS = ['conforming', 'partial', 'non-conforming'] as const;

export function webmcpDisponible(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof document.modelContext?.registerTool === 'function'
  );
}

/**
 * Registra los tools WebMCP de EthiScope.
 * El patrón central: el agente redacta, el humano aprueba. compile_report
 * solo incluye criterios aprobados.
 */
export async function registrarToolsWebmcp(): Promise<void> {
  if (!webmcpDisponible()) return;

  const modelContext = document.modelContext;
  if (!modelContext) return;

  const registro = useAuditoriaStore.getState;

  await modelContext.registerTool({
    name: 'list_frameworks',
    title: 'List audit frameworks',
    description:
      'List the audit frameworks available in EthiScope (EU AI Act and NIST AI RMF) with their criteria ids, categories and descriptions. Use this to find the right criteria to assess.',
    inputSchema: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: ['euaia', 'nist'],
          description: 'Only return criteria from this framework. Optional.',
        },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const framework =
        typeof input.framework === 'string' &&
        MARCOS.some((marco) => marco.id === input.framework)
          ? input.framework
          : null;

      const criterios = framework
        ? CRITERIOS.filter((criterio) => criterio.marco === framework)
        : CRITERIOS;

      return {
        frameworks: MARCOS.map((marco) => ({
          id: marco.id,
          name: marco.nombre,
          description: marco.descripcion,
        })),
        criteria: criterios.map((criterio) => ({
          id: criterio.id,
          framework: criterio.marco,
          category: criterio.categoria,
          title: criterio.titulo,
          description: criterio.descripcion,
        })),
      };
    },
  });

  await modelContext.registerTool({
    name: 'get_audit_state',
    title: 'Get audit state',
    description:
      'Read the current audit: which criteria are pending, in draft, approved or rejected, and what evidence has been gathered. Use this before drafting so you know what remains.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const estado = registro();

      const resumen: Record<string, number> = {
        pending: 0,
        draft: 0,
        approved: 0,
        rejected: 0,
      };
      const detalle = CRITERIOS.map((criterio) => {
        const evaluacion = estado.evaluaciones[criterio.id];
        const estadoCriterio = evaluacion?.estado ?? 'pending';
        resumen[estadoCriterio] = (resumen[estadoCriterio] ?? 0) + 1;
        return {
          id: criterio.id,
          framework: criterio.marco,
          title: criterio.titulo,
          status: estadoCriterio,
          rating: evaluacion?.rating ?? null,
          evidenceCount: evaluacion?.evidencia.length ?? 0,
        };
      });

      return {
        systemName: estado.sistemaNombre,
        systemDescription: estado.descripcionSistema,
        summary: resumen,
        criteria: detalle,
      };
    },
  });

  await modelContext.registerTool({
    name: 'draft_assessment',
    title: 'Draft assessment',
    description:
      'Write a draft assessment for one criterion with a proposed rating. Drafts are NOT part of the final report: they stay in "pending review" until the human approves them in the UI. Draft one criterion at a time.',
    inputSchema: {
      type: 'object',
      properties: {
        criterion_id: {
          type: 'string',
          description: 'Criterion id from list_frameworks.',
        },
        rating: {
          type: 'string',
          enum: [...RATINGS],
          description: 'Proposed conformance rating.',
        },
        text: {
          type: 'string',
          description:
            'Draft assessment text. State findings and reasoning clearly, referencing evidence if available.',
        },
      },
    },
    execute: async (input) => {
      const criterion_id =
        typeof input.criterion_id === 'string' ? input.criterion_id : null;

      if (!criterion_id || !buscarCriterio(criterion_id)) {
        return {
          error: 'criterion_id must be a valid id from list_frameworks.',
        };
      }

      const rating = input.rating;
      if (typeof rating !== 'string' || !RATINGS.includes(rating as Rating)) {
        return { error: `rating must be one of: ${RATINGS.join(', ')}.` };
      }

      const text = typeof input.text === 'string' ? input.text.trim() : '';
      if (text.length === 0) {
        return { error: 'text must be a non-empty assessment.' };
      }

      registro().guardarBorrador(
        criterion_id,
        text.slice(0, 4000),
        rating as Rating,
        'agent',
        'draft_assessment',
      );

      return {
        status: 'draft_pending_review',
        criterion_id,
        rating,
        note: 'The human must approve this draft in the EthiScope UI before it enters the final report.',
      };
    },
  });

  await modelContext.registerTool({
    name: 'add_evidence',
    title: 'Add evidence',
    description:
      'Attach evidence to a criterion: a URL to a document, test result or policy, and/or a short text note. Evidence supports the draft but does not enter the final report until the human approves the criterion.',
    inputSchema: {
      type: 'object',
      properties: {
        criterion_id: {
          type: 'string',
          description: 'Criterion id from list_frameworks.',
        },
        url: {
          type: 'string',
          description: 'URL to the evidence (document, test report, policy).',
        },
        text: {
          type: 'string',
          description: 'Short description of the evidence.',
        },
      },
    },
    execute: async (input) => {
      const criterion_id =
        typeof input.criterion_id === 'string' ? input.criterion_id : null;

      if (!criterion_id || !buscarCriterio(criterion_id)) {
        return {
          error: 'criterion_id must be a valid id from list_frameworks.',
        };
      }

      const url =
        typeof input.url === 'string' && input.url.length > 0
          ? input.url
          : null;
      const text =
        typeof input.text === 'string' && input.text.length > 0
          ? input.text.slice(0, 500)
          : null;

      if (!url && !text) {
        return { error: 'Provide at least one of: url or text.' };
      }

      registro().agregarEvidencia(
        criterion_id,
        { url, text },
        'agent',
        'add_evidence',
      );

      const cantidad =
        registro().evaluaciones[criterion_id]?.evidencia.length ?? 0;

      return { criterion_id, evidenceCount: cantidad };
    },
  });

  await modelContext.registerTool({
    name: 'compile_report',
    title: 'Compile report',
    description:
      'Generate the final markdown report. Only criteria explicitly APPROVED by the human in the UI are included. If nothing is approved yet, this returns an empty report with a hint.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const estado = registro();
      const reporte = compilarReporte(estado);
      const aprobados = CRITERIOS.filter(
        (criterio) => estado.evaluaciones[criterio.id]?.estado === 'approved',
      ).length;

      return {
        approvedCriteriaCount: aprobados,
        report: reporte,
      };
    },
  });
}
