import html2canvas from 'html2canvas';

/**
 * Captura el div con id="tabla-resultados" y lo descarga como imagen PNG.
 * @param {string} mesId - ID del mes en formato YYYY-MM (ej: "2026-09")
 */
export const generarImagen = async (mesId) => {
  const elemento = document.getElementById('tabla-resultados');
  if (!elemento) {
    console.error('No se encontró el elemento #tabla-resultados');
    return;
  }

  try {
    const canvas = await html2canvas(elemento, {
      scale: 2,          // doble resolución → imagen nítida en móvil y escritorio
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    // Convertir canvas a PNG y disparar descarga
    const imagen = canvas.toDataURL('image/png');
    const enlace = document.createElement('a');
    enlace.href = imagen;
    enlace.download = `recibo-mantenimiento-${mesId || 'mes'}.png`;
    enlace.click();
  } catch (err) {
    console.error('Error al generar la imagen:', err);
  }
};
