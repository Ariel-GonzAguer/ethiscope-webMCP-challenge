import { useState } from 'react';
import { useAuditoriaStore } from '../../store/auditoria';
import { CRITERIOS, MARCOS } from '../../datos/marcos';
import type { EstadoCriterio, MarcoId } from '../../tipos/dominio';
import Marco from '../../componentes/marco';
import RegistroActividad from '../../componentes/registro-actividad';
import './auditoria.css';

const ETIQUETAS_ESTADO: Record<EstadoCriterio, string> = {
  pending: 'Pending',
  draft: 'Draft — needs review',
  approved: 'Approved',
  rejected: 'Rejected',
};

function Auditoria() {
  const sistemaNombre = useAuditoriaStore((estado) => estado.sistemaNombre);
  const setSistemaNombre = useAuditoriaStore((estado) => estado.setSistemaNombre);
  const descripcionSistema = useAuditoriaStore((estado) => estado.descripcionSistema);
  const setDescripcionSistema = useAuditoriaStore((estado) => estado.setDescripcionSistema);
  const evaluaciones = useAuditoriaStore((estado) => estado.evaluaciones);
  const aprobarCriterio = useAuditoriaStore((estado) => estado.aprobarCriterio);
  const rechazarCriterio = useAuditoriaStore((estado) => estado.rechazarCriterio);
  const [marcoFiltro, setMarcoFiltro] = useState<MarcoId | 'todos'>('todos');

  const criterios =
    marcoFiltro === 'todos'
      ? CRITERIOS
      : CRITERIOS.filter((criterio) => criterio.marco === marcoFiltro);

  return (
    <Marco>
      <h1>Audit</h1>
      <p className="intro-auditoria">
        The agent drafts, <strong>you</strong> decide. Nothing enters the final report without
        your explicit approval.
      </p>

      <div className="auditoria-layout">
        <div className="auditoria-principal">
          <div className="config-sistema tarjeta">
            <label htmlFor="nombre-sistema">System under audit:</label>
            <input
              id="nombre-sistema"
              type="text"
              value={sistemaNombre}
              onChange={(evento) => setSistemaNombre(evento.target.value)}
            />
            <label htmlFor="descripcion-sistema">Description:</label>
            <textarea
              id="descripcion-sistema"
              rows={2}
              value={descripcionSistema}
              onChange={(evento) => setDescripcionSistema(evento.target.value)}
              placeholder="What does the system do? Who uses it?"
            />
          </div>

          <div className="filtro-marco" role="group" aria-label="Filter by framework">
            <button
              type="button"
              className={marcoFiltro === 'todos' ? 'chip-marco activo' : 'chip-marco'}
              aria-pressed={marcoFiltro === 'todos'}
              onClick={() => setMarcoFiltro('todos')}
            >
              All
            </button>
            {MARCOS.map((marco) => (
              <button
                key={marco.id}
                type="button"
                className={marcoFiltro === marco.id ? 'chip-marco activo' : 'chip-marco'}
                aria-pressed={marcoFiltro === marco.id}
                onClick={() => setMarcoFiltro(marco.id)}
              >
                {marco.nombre}
              </button>
            ))}
          </div>

          <ul className="lista-criterios" aria-label="Audit criteria">
            {criterios.map((criterio) => {
              const evaluacion = evaluaciones[criterio.id];
              const estado = evaluacion?.estado ?? 'pending';

              return (
                <li key={criterio.id} className={`criterio tarjeta estado-${estado}`}>
                  <div className="cabecera-criterio">
                    <h2>
                      <span className="categoria-criterio">{criterio.categoria}</span> —{' '}
                      {criterio.titulo}
                    </h2>
                    <span className={`badge-estado estado-${estado}`}>
                      {ETIQUETAS_ESTADO[estado]}
                    </span>
                  </div>
                  <p className="descripcion-criterio">{criterio.descripcion}</p>

                  {estado === 'pending' && (
                    <p className="nota-pendiente">
                      Waiting for the agent to draft an assessment — or draft it yourself below.
                    </p>
                  )}

                  {estado === 'draft' && (
                    <div className="panel-revision">
                      <blockquote className="draft-texto">
                        {evaluacion?.draft}
                      </blockquote>
                      <div className="rating-draft">
                        Proposed rating:{' '}
                        <strong>{evaluacion?.rating ?? 'n/a'}</strong>
                      </div>
                      <div className="acciones-revision">
                        <button
                          type="button"
                          className="boton aprobar"
                          onClick={() => aprobarCriterio(criterio.id, 'human')}
                        >
                          ✓ Approve
                        </button>
                        <button
                          type="button"
                          className="boton rechazar"
                          onClick={() => rechazarCriterio(criterio.id, 'human')}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {estado === 'approved' && (
                    <blockquote className="texto-final">
                      {evaluacion?.versionFinal}
                    </blockquote>
                  )}

                  {evaluacion && evaluacion.evidencia.length > 0 && (
                    <ul className="lista-evidencia" aria-label={`Evidence for ${criterio.titulo}`}>
                      {evaluacion.evidencia.map((evidencia, indice) => (
                        <li key={indice}>
                          {evidencia.url ? (
                            <a href={evidencia.url} target="_blank" rel="noreferrer">
                              {evidencia.text ?? evidencia.url}
                            </a>
                          ) : (
                            evidencia.text
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <RegistroActividad />
      </div>
    </Marco>
  );
}

export default Auditoria;
