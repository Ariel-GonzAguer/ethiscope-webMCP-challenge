import { Link } from '@arielgonzaguer/michi-router';
import IndicadorWebmcp from '../indicador-webmcp';

const enlaces = [
  { a: '/', etiqueta: 'Audit' },
  { a: '/reporte', etiqueta: 'Report' },
  { a: '/aprender', etiqueta: 'Learn' },
] as const;

export default function Encabezado() {
  return (
    <header className="encabezado">
      <span className="marca" aria-label="EthiScope home">
        ⚖️ EthiScope
      </span>
      <nav aria-label="Navegación principal" className="nav-principal">
        {enlaces.map(({ a, etiqueta }) => (
          <Link key={a} to={a}>
            {etiqueta}
          </Link>
        ))}
      </nav>
      <IndicadorWebmcp />
    </header>
  );
}
