import { useEffect } from 'react';
import { useLocation } from '@arielgonzaguer/michi-router';

export default function ScrollAlInicio() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
