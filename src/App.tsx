import { RouterProvider } from '@arielgonzaguer/michi-router';
import Auditoria from './paginas/auditoria';
import Reporte from './paginas/reporte';
import Aprender from './paginas/aprender';
import { useWebmcp } from './hooks/useWebmcp';
import ScrollAlInicio from './componentes/scroll-al-inicio';

export default function App() {
  useWebmcp();

  return (
    <>
      <ScrollAlInicio />
      <RouterProvider
        routes={[
          { path: '/', component: <Auditoria /> },
          { path: '/reporte', component: <Reporte /> },
          { path: '/aprender', component: <Aprender /> },
        ]}
        notFound={<h1>404 — Page not found</h1>}
      />
    </>
  );
}
