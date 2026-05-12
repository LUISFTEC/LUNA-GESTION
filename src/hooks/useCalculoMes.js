import { useMemo } from 'react';
import { calcularResultadosMes } from '../utils/calculosMantenimiento';

/**
 * Hook para calcular los resultados del mes
 */
export const useCalculoMes = (datosMes, departamentos) => {
  const resultados = useMemo(() => {
    if (!datosMes || !departamentos || departamentos.length === 0) {
      return null;
    }
    
    return calcularResultadosMes(datosMes, departamentos);
  }, [datosMes, departamentos]);
  
  return resultados;
};