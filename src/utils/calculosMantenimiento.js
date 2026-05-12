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
  return formatearDecimales((agua + luz) / totalHabitantes);
};

/**
 * Calcula el costo fijo de limpieza por departamento
 */
export const calcularCostoFijoLimpieza = (limpieza, cantidadDptos) => {
  if (cantidadDptos === 0) return 0;
  return formatearDecimales(limpieza / cantidadDptos); 
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
  
  // 3. Costos unitarios
  const costoPorPersona = calcularCostoPorPersona(agua, luz, totalHabitantes);
  const costoFijoLimpieza = calcularCostoFijoLimpieza(limpieza, totalDptos);
  
  // 4. Calcular montos por departamento con TU REGLA
  const departamentosConMontos = dptosCompletos.map(dpto => {
    const costoAguaLuzDpto = formatearDecimales(costoPorPersona * dpto.habitantes);
    const montoExacto = formatearDecimales(costoAguaLuzDpto + costoFijoLimpieza);
    
    // *** CAMBIO CLAVE AQUÍ: Le pasamos los habitantes para que sepa cómo redondear ***
    const montoRedondeado = redondeoEspecial(montoExacto, dpto.habitantes);
    
    return {
      numero: dpto.numero,
      habitantes: dpto.habitantes,
      costoAguaLuz: costoAguaLuzDpto,
      costoLimpieza: costoFijoLimpieza,
      montoExacto,
      montoRedondeado,
      diferencia: formatearDecimales(montoRedondeado - montoExacto)
    };
  });
  
  // 5. Sumar los totales a recaudar (Basado en el redondeo)
  const totalRedondeado = formatearDecimales(
    departamentosConMontos.reduce((sum, d) => sum + d.montoRedondeado, 0)
  );
  
  // 6. Calcular Caja Chica (Total que entra - Gasto real)
  // Al redondear hacia arriba para los de 1 persona, este número dejará de ser rojo
  const cajaChica = formatearDecimales(totalRedondeado - totalServicios);
  
  return {
    costoPorPersona,
    costoFijoLimpieza,
    totalHabitantes,
    totalDptos,
    departamentos: departamentosConMontos,
    totalRedondeado,
    cajaChica,
    totalServicios,
    // Agregamos esto para que el PDF no explote:
    totalAgua: agua, 
    totalLuz: luz,
    totalLimpieza: limpieza
  };
};