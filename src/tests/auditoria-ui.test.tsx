import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuditoriaStore } from '../store/auditoria';
import Auditoria from '../paginas/auditoria';

vi.mock('@arielgonzaguer/michi-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

beforeEach(() => {
  useAuditoriaStore.getState().reiniciarAuditoria();
});

describe('página Auditoría', () => {
  it('renderiza los criterios del marco EU AI Act', () => {
    render(<Auditoria />);
    expect(screen.getByText(/Transparency and information/)).toBeInTheDocument();
    expect(screen.getByText(/Human oversight/)).toBeInTheDocument();
  });

  it('el filtro NIST oculta los criterios EU', async () => {
    const usuario = userEvent.setup();
    render(<Auditoria />);

    await usuario.click(screen.getByRole('button', { name: 'NIST AI RMF' }));

    expect(screen.queryByText(/Transparency and information/)).not.toBeInTheDocument();
    expect(screen.getByText(/AI risk governance/)).toBeInTheDocument();
  });

  it('muestra el draft del agente con botones de aprobación', () => {
    useAuditoriaStore
      .getState()
      .guardarBorrador('euaia-transparency', 'Agent draft here.', 'partial', 'agent', 'draft_assessment');

    render(<Auditoria />);
    expect(screen.getByText('Agent draft here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('aprobar mueve el criterio a approved y muestra el texto final', async () => {
    const usuario = userEvent.setup();
    useAuditoriaStore
      .getState()
      .guardarBorrador('euaia-transparency', 'Final text.', 'conforming', 'agent', 'draft_assessment');

    render(<Auditoria />);
    await usuario.click(screen.getByRole('button', { name: /approve/i }));

    expect(screen.getByText('Final text.')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('rechazar mueve el criterio a rejected sin texto final', async () => {
    const usuario = userEvent.setup();
    useAuditoriaStore
      .getState()
      .guardarBorrador('euaia-transparency', 'Bad text.', 'non-conforming', 'agent', 'draft_assessment');

    render(<Auditoria />);
    await usuario.click(screen.getByRole('button', { name: /reject/i }));

    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.queryByText('Bad text.')).not.toBeInTheDocument();
  });

  it('muestra evidencia adjunta con enlace', () => {
    useAuditoriaStore
      .getState()
      .agregarEvidencia('euaia-logging', { url: 'https://example.com/ev', text: 'Log review' }, 'agent', 'add_evidence');

    render(<Auditoria />);
    const enlace = screen.getByRole('link', { name: 'Log review' });
    expect(enlace).toHaveAttribute('href', 'https://example.com/ev');
  });

  it('el activity log muestra entradas del agente con tool', () => {
    useAuditoriaStore
      .getState()
      .guardarBorrador('euaia-transparency', 'x', 'partial', 'agent', 'draft_assessment');

    render(<Auditoria />);
    expect(screen.getByLabelText('Audit activity log')).toHaveTextContent('draft_assessment');
  });
});
