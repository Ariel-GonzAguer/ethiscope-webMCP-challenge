import { useState } from 'react';
import { useAuditoriaStore, compilarReporte } from '../../store/auditoria';
import Marco from '../../componentes/marco';
import './reporte.css';

function Reporte() {
  const estado = useAuditoriaStore();
  const [copiado, setCopiado] = useState(false);

  const reporte = compilarReporte(estado);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(reporte);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error: unknown) {
      console.error('No se pudo copiar el reporte', error);
    }
  }

  function descargar() {
    const blob = new Blob([reporte], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `${estado.sistemaNombre.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'audit'}-report.md`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Marco>
      <h1>Report</h1>
      <p className="intro-reporte">
        This report contains <strong>only criteria you approved</strong>. Drafts and rejected
        items never appear here.
      </p>

      <div className="acciones-reporte">
        <button type="button" className="boton-reporte" onClick={copiar}>
          {copiado ? 'Copied!' : 'Copy markdown'}
        </button>
        <button type="button" className="boton-reporte" onClick={descargar}>
          Download .md
        </button>
      </div>

      <pre className="vista-reporte" aria-label="Final report preview">
        {reporte}
      </pre>
    </Marco>
  );
}

export default Reporte;
