/**
 * Asegura que los números tengan máximo 2 decimales para evitar errores de JS
 * ¡IMPORTANTE! Debe tener la palabra 'export' al inicio
 */
export const formatearDecimales = (numero) => {
  return Math.round((numero + Number.EPSILON) * 100) / 100;
};

/**
 * REDONDEO AL TECHO MÁS CERCANO EN MÚLTIPLOS DE S/ 0.10
 *
 * Regla única (aplica a cualquier número de habitantes):
 *   - Se usa Math.ceil con 1 decimal: sube al décimo de sol inmediato superior.
 *   - Ejemplos: 39.14 → 39.20 | 58.71 → 58.80 | 117.42 → 117.50
 *
 * Garantías:
 *   ✓ El resultado tiene como máximo 1 decimal (.10, .20 … .90 ó .00)
 *   ✓ Nunca redondea hacia abajo → la caja nunca queda en déficit
 *   ✓ Departamentos con 0 habitantes siempre pagan S/ 0.00
 */
export const redondeoEspecial = (monto, habitantes) => {
  // Un departamento vacío NUNCA paga (aunque tenga costo fijo de limpieza asignado)
  if (monto === 0 || habitantes === 0) return 0;

  // Techo al 0.10 más cercano (1 decimal)
  return Math.ceil(monto * 10) / 10;
};