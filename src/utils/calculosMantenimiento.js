import { formatearDecimales, redondeoEspecial } from './redondeoEspecial';

// LISTA MAESTRA: Aquí forzamos a que siempre existan estos 13 departamentos
const TODOS_LOS_DEPARTAMENTOS = [
  '201', '202', '203', '204', 
  '301', '302', '303', '304', 
  '401', '402', '403', 
  '501', '502'
];

/**
 * Calcula el costo por persona (Agua + Luz) / Total Habitantes
 */
export const calcularCostoPorPersona = (agua, luz, totalHabitantes) => {
  if (totalHabitantes === 0) return 0;
  return (agua + luz) / totalHabitantes;
};

/**
 * Calcula el costo fijo de limpieza por departamento
 */
export const calcularCostoFijoLimpieza = (limpieza, cantidadDptos) => {
  if (cantidadDptos === 0) return 0;
  return limpieza / cantidadDptos; 
};

/**
 * Calcula todos los resultados del mes en VIVO
 */
export const calcularResultadosMes = (datosMes, departamentosRegistrados) => {
  
  const recibos = datosMes?.recibos || {};
  const agua = recibos.agua?.monto || 0;
  const luz = recibos.luz?.monto || 0;
  const limpieza = recibos.limpieza?.monto || 0;
  
  // 1. Combinamos lista maestra con datos guardados
  const dptosCompletos = TODOS_LOS_DEPARTAMENTOS.map(numeroDpto => {
    const guardado = (departamentosRegistrados || []).find(d => d.numero === numeroDpto);
    return {
      numero: numeroDpto,
      habitantes: guardado && guardado.habitantes ? parseInt(guardado.habitantes) : 0
    };
  });
  
  // 2. Totales generales
  const totalHabitantes = dptosCompletos.reduce((sum, dpto) => sum + dpto.habitantes, 0);
  const totalDptos = dptosCompletos.length;
  const totalServicios = agua + luz + limpieza;
  
  // 3. Costos unitarios exactos (sin redondear para evitar errores compuestos)
  const costoPorPersona = calcularCostoPorPersona(agua, luz, totalHabitantes);
  const costoFijoLimpieza = calcularCostoFijoLimpieza(limpieza, totalDptos);
  
  // 4. Calcular montos por departamento con TU REGLA
  const departamentosConMontos = dptosCompletos.map(dpto => {
    const costoAguaLuzDpto = costoPorPersona * dpto.habitantes;
    const montoExacto = costoAguaLuzDpto + costoFijoLimpieza;
    
    // Aplicar redondeo especial visualmente
    const montoRedondeado = redondeoEspecial(montoExacto, dpto.habitantes);
    
    return {
      numero: dpto.numero,
      habitantes: dpto.habitantes,
      costoAguaLuz: formatearDecimales(costoAguaLuzDpto),
      costoLimpieza: formatearDecimales(costoFijoLimpieza),
      montoExacto: formatearDecimales(montoExacto),
      montoRedondeado,
      diferencia: formatearDecimales(montoRedondeado - montoExacto)
    };
  });
  
  // 5. Suma de montos redondeados visuales
  const sumaRedondeados = formatearDecimales(
    departamentosConMontos.reduce((sum, d) => sum + d.montoRedondeado, 0)
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 6. AJUSTE DE RESIDUO
  //    Si la suma de cuotas redondeadas < totalServicios (déficit), el faltante
  //    se añade al departamento con más habitantes (mayor consumo proporcional).
  //    Regla de negocio: cajaChica NUNCA puede ser negativa.
  // ─────────────────────────────────────────────────────────────────────────
  const residuo = formatearDecimales(totalServicios - sumaRedondeados);

  // Buscamos el índice del departamento con MÁS habitantes (> 0) para el ajuste.
  // Nunca asignamos el residuo a un dpto vacío (hab=0).
  const idxMayorConsumo = departamentosConMontos.reduce(
    (maxIdx, dpto, idx, arr) => {
      if (dpto.habitantes === 0) return maxIdx; // ignorar dptos vacíos
      return dpto.habitantes > arr[maxIdx].habitantes ? idx : maxIdx;
    },
    departamentosConMontos.findIndex(d => d.habitantes > 0) // primer dpto no vacío como base
  );

  // Aplicamos el ajuste con map() para evitar mutar el array original.
  // idxMayorConsumo será -1 si TODOS los dptos tienen 0 hab (no hay a quien ajustar).
  const departamentosAjustados = departamentosConMontos.map((dpto, idx) => {
    if (residuo <= 0 || idxMayorConsumo < 0 || idx !== idxMayorConsumo) return dpto;
    const nuevoMonto = formatearDecimales(dpto.montoRedondeado + residuo);
    return {
      ...dpto,
      montoRedondeado: nuevoMonto,
      diferencia: formatearDecimales(nuevoMonto - dpto.montoExacto)
    };
  });

  // 7. Sumar los totales a recaudar (con el ajuste de residuo aplicado)
  const totalRedondeado = formatearDecimales(
    departamentosAjustados.reduce((sum, d) => sum + d.montoRedondeado, 0)
  );
  
  // 8. Calcular Caja Chica (Total que entra - Gasto real), garantizando >= 0
  const cajaChica = formatearDecimales(totalRedondeado - totalServicios);
  
  return {
    costoPorPersona: formatearDecimales(costoPorPersona),
    costoFijoLimpieza: formatearDecimales(costoFijoLimpieza),
    totalHabitantes,
    totalDptos,
    departamentos: departamentosAjustados,
    totalRedondeado,
    cajaChica,
    totalServicios,
    // Agregamos esto para que el PDF no explote:
    totalAgua: agua, 
    totalLuz: luz,
    totalLimpieza: limpieza
  };
};