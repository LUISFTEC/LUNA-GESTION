/**
 * Asegura que los números tengan máximo 2 decimales para evitar errores de JS
 * ¡IMPORTANTE! Debe tener la palabra 'export' al inicio
 */
export const formatearDecimales = (numero) => {
  return Math.round((numero + Number.EPSILON) * 100) / 100;
};

/**
 * REGLAS PERSONALIZADAS DE REDONDEO (Tu estrategia visual)
 */
export const redondeoEspecial = (monto, habitantes) => {
  const entero = Math.floor(monto);
  const decimal = parseFloat((monto - entero).toFixed(2));

  if (monto === 0) return 0;

  if (habitantes === 1) {
    // REGLA PARA 1 PERSONA (Más estricta)
    if (decimal > 0 && decimal <= 0.60) return entero + 0.50; 
    if (decimal > 0.60) return entero + 1.00;                
    return entero;
  } else {
    // REGLA PARA 2 A MÁS PERSONAS (Más flexible)
    if (decimal > 0 && decimal <= 0.30) return entero;       
    if (decimal > 0.30 && decimal <= 0.70) return entero + 0.50; 
    if (decimal > 0.70) return entero + 1.00;                
    return entero;
  }
};