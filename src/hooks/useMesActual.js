import { useState, useEffect } from 'react';

/**
 * Hook para obtener el mes actual en formato YYYY-MM
 */
export const useMesActual = () => {
  const [mesId, setMesId] = useState('');
  
  useEffect(() => {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    setMesId(`${anio}-${mes}`);
  }, []);
  
  return mesId;
};