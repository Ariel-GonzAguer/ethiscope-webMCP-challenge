/* eslint-disable @typescript-eslint/require-await --
   Los mocks del contrato WebMCP exponen métodos `async` aunque el motor de
   reglas es síncrono; replican la firma de la API real. */

import { beforeEach, describe, expect, it } from 'vitest';
import { registrarToolsWebmcp } from '../webmcp/registrarTools';
import { useAuditoriaStore } from '../store/auditoria';

interface ToolRegistrada {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

async function instalarModelContextFake(): Promise<
  Map<string, ToolRegistrada>
> {
  const tools = new Map<string, ToolRegistrada>();

  Object.defineProperty(document, 'modelContext', {
    value: {
      registerTool: async (tool: ToolRegistrada) => {
        tools.set(tool.name, tool);
      },
      getTools: async () => [...tools.values()],
    },
    configurable: true,
  });

  await registrarToolsWebmcp();
  return tools;
}

beforeEach(() => {
  useAuditoriaStore.getState().reiniciarAuditoria();
});

describe('registrarToolsWebmcp', () => {
  it('registra los 5 tools', async () => {
    const tools = await instalarModelContextFake();
    expect(tools.size).toBe(5);
    for (const nombre of [
      'list_frameworks',
      'get_audit_state',
      'draft_assessment',
      'add_evidence',
      'compile_report',
    ]) {
      expect(tools.has(nombre), `falta ${nombre}`).toBe(true);
    }
  });

  it('anota readOnlyHint en tools de lectura', async () => {
    const tools = await instalarModelContextFake();
    expect(tools.get('list_frameworks')?.annotations?.readOnlyHint).toBe(true);
    expect(tools.get('compile_report')?.annotations?.readOnlyHint).toBe(true);
    expect(
      tools.get('draft_assessment')?.annotations?.readOnlyHint,
    ).toBeUndefined();
  });
});

describe('tool list_frameworks', () => {
  it('lista todos los criterios sin filtro', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('list_frameworks')!.execute({})) as {
      criteria: { id: string }[];
    };
    expect(resultado.criteria.length).toBeGreaterThanOrEqual(15);
  });

  it('filtra por marco', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools
      .get('list_frameworks')!
      .execute({ framework: 'euaia' })) as {
      criteria: { framework: string }[];
    };
    expect(resultado.criteria.length).toBeGreaterThan(0);
    expect(resultado.criteria.every((c) => c.framework === 'euaia')).toBe(true);
  });
});

describe('tool get_audit_state', () => {
  it('reporta el estado inicial (todo pending)', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('get_audit_state')!.execute({})) as {
      summary: { pending: number };
    };
    expect(resultado.summary.pending).toBeGreaterThan(0);
  });

  it('refleja drafts del agente', async () => {
    useAuditoriaStore
      .getState()
      .guardarBorrador(
        'euaia-transparency',
        'Draft',
        'partial',
        'agent',
        'draft_assessment',
      );

    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('get_audit_state')!.execute({})) as {
      summary: { draft: number };
    };
    expect(resultado.summary.draft).toBe(1);
  });
});

describe('tool draft_assessment', () => {
  it('guarda el borrador en pending review', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('draft_assessment')!.execute({
      criterion_id: 'euaia-transparency',
      rating: 'partial',
      text: 'The system discloses AI use but lacks details.',
    })) as { status: string; note: string };

    expect(resultado.status).toBe('draft_pending_review');
    expect(resultado.note).toContain('human must approve');
    expect(
      useAuditoriaStore.getState().evaluaciones['euaia-transparency']?.estado,
    ).toBe('draft');
  });

  it('rechaza criterios desconocidos', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('draft_assessment')!.execute({
      criterion_id: 'no-existe',
      rating: 'partial',
      text: 'x',
    })) as { error?: string };

    expect(resultado.error).toContain('criterion_id must be a valid id');
  });

  it('rechaza ratings inválidos', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('draft_assessment')!.execute({
      criterion_id: 'euaia-transparency',
      rating: 'excellent',
      text: 'x',
    })) as { error?: string };

    expect(resultado.error).toContain('rating must be one of');
  });

  it('rechaza texto vacío', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('draft_assessment')!.execute({
      criterion_id: 'euaia-transparency',
      rating: 'partial',
      text: '   ',
    })) as { error?: string };

    expect(resultado.error).toContain('non-empty');
  });
});

describe('tool add_evidence', () => {
  it('agrega evidencia con URL', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('add_evidence')!.execute({
      criterion_id: 'euaia-logging',
      url: 'https://example.com/logs.pdf',
      text: 'Logging architecture review',
    })) as { evidenceCount: number };

    expect(resultado.evidenceCount).toBe(1);
  });

  it('exige al menos url o text', async () => {
    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('add_evidence')!.execute({
      criterion_id: 'euaia-logging',
    })) as { error?: string };

    expect(resultado.error).toContain('Provide at least one');
  });
});

describe('tool compile_report', () => {
  it('solo incluye criterios aprobados por el humano', async () => {
    const { guardarBorrador, aprobarCriterio } = useAuditoriaStore.getState();
    guardarBorrador(
      'euaia-transparency',
      'Approved content.',
      'conforming',
      'agent',
      'draft_assessment',
    );
    aprobarCriterio('euaia-transparency', 'human');
    guardarBorrador(
      'nist-map-context',
      'Unapproved content.',
      'partial',
      'agent',
      'draft_assessment',
    );

    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('compile_report')!.execute({})) as {
      approvedCriteriaCount: number;
      report: string;
    };

    expect(resultado.approvedCriteriaCount).toBe(1);
    expect(resultado.report).toContain('Approved content.');
    expect(resultado.report).not.toContain('Unapproved content.');
  });

  it('reporta 0 aprobados si nada fue aprobado', async () => {
    useAuditoriaStore
      .getState()
      .guardarBorrador(
        'euaia-transparency',
        'Draft only.',
        'partial',
        'agent',
        'draft_assessment',
      );

    const tools = await instalarModelContextFake();
    const resultado = (await tools.get('compile_report')!.execute({})) as {
      approvedCriteriaCount: number;
    };

    expect(resultado.approvedCriteriaCount).toBe(0);
  });
});
