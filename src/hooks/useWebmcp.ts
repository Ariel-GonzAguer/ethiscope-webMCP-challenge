import { useEffect } from 'react';
import { registrarToolsWebmcp, webmcpDisponible } from '../webmcp/registrarTools';

export function useWebmcp() {
  useEffect(() => {
    if (!webmcpDisponible()) return;
    void registrarToolsWebmcp();
  }, []);
}
