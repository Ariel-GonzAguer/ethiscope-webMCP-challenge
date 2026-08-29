import { useAuditoriaStore } from '../../store/auditoria';

export default function RegistroActividad() {
  const log = useAuditoriaStore((estado) => estado.log);
  const recientes = [...log].reverse().slice(0, 40);

  return (
    <aside className="registro-actividad tarjeta" aria-label="Audit activity log">
      <h2>Activity</h2>
      {recientes.length === 0 ? (
        <p className="log-vacio">
          No activity yet. Ask your agent to draft an assessment.
        </p>
      ) : (
        <ul className="lista-log">
          {recientes.map((entrada) => (
            <li
              key={entrada.id}
              className={`entrada-log ${entrada.actor === 'agent' ? 'agente' : 'humano'}`}
            >
              <div>
                <span className="etiqueta-actor">{entrada.actor}</span>
                <span className="hora">{new Date(entrada.timestamp).toLocaleTimeString()}</span>
              </div>
              <div>
                {entrada.tool ? <em>{entrada.tool}:</em> : null} {entrada.message}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
