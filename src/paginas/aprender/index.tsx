import Marco from '../../componentes/marco';
import { webmcpDisponible } from '../../webmcp/registrarTools';
import './aprender.css';

interface ToolDoc {
  nombre: string;
  tipo: 'read' | 'write';
  queHace: string;
  ejemplo: string;
}

const TOOLS: readonly ToolDoc[] = [
  {
    nombre: 'list_frameworks',
    tipo: 'read',
    queHace: 'Lists the EU AI Act and NIST AI RMF criteria with ids, categories and descriptions.',
    ejemplo: '"What criteria apply to transparency?"',
  },
  {
    nombre: 'get_audit_state',
    tipo: 'read',
    queHace: 'Reads which criteria are pending, drafted, approved or rejected.',
    ejemplo: '"Show me the current audit status."',
  },
  {
    nombre: 'draft_assessment',
    tipo: 'write',
    queHace: 'Writes a draft assessment with a proposed rating. Stays in "pending review" — never enters the report by itself.',
    ejemplo: '"Draft an assessment of our chatbot against the EU AI Act transparency criterion."',
  },
  {
    nombre: 'add_evidence',
    tipo: 'write',
    queHace: 'Attaches evidence (URL or note) to a criterion.',
    ejemplo: '"Add this evaluation report as evidence for robustness."',
  },
  {
    nombre: 'compile_report',
    tipo: 'read',
    queHace: 'Builds the final markdown report from approved criteria only.',
    ejemplo: '"Compile the report."',
  },
];

export default function Aprender() {
  const activo = webmcpDisponible();

  return (
    <Marco>
      <h1>Learn — how EthiScope works</h1>
      <p className="intro-aprender">
        EthiScope registers <strong>5 structured tools</strong> via{' '}
        <a href="https://webmachinelearning.github.io/webmcp/" target="_blank" rel="noreferrer">
          WebMCP
        </a>
        . The core pattern is trust: <strong>the agent drafts, the human approves.</strong>{' '}
        <code>compile_report</code> can only include criteria you explicitly approved in the UI.
      </p>

      <p className={`estado-webmcp ${activo ? 'activo' : ''}`} role="status">
        {activo
          ? 'WebMCP is active in this browser — the agent can see these tools.'
          : 'WebMCP not detected. Open EthiScope in ChatGPT (in-app browser) or Chrome with the WebMCP flag to let the agent in.'}
      </p>

      <h2>The 5 tools</h2>
      <div className="rejilla-tools">
        {TOOLS.map((tool) => (
          <article key={tool.nombre} className="tool tarjeta">
            <h3>
              <code>{tool.nombre}</code>{' '}
              <span className={`badge-tipo ${tool.tipo}`}>
                {tool.tipo === 'read' ? 'read-only' : 'write'}
              </span>
            </h3>
            <p>{tool.queHace}</p>
            <p className="ejemplo-tool">
              <strong>Try in ChatGPT:</strong> {tool.ejemplo}
            </p>
          </article>
        ))}
      </div>

      <h2>The trust loop</h2>
      <ol className="lista-bucle">
        <li>The agent drafts an assessment for a criterion — it lands in <em>Draft</em>.</li>
        <li>You read it, check the evidence, and <strong>Approve</strong> or <strong>Reject</strong>.</li>
        <li>Only approved criteria appear in the Report, copyable as markdown.</li>
        <li>Every action is logged: who did what, with which tool.</li>
      </ol>
      <p className="cierre-aprender">
        The agent audits the AI — <strong>you audit the agent.</strong>
      </p>
    </Marco>
  );
}
