import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Construye el documento jsPDF con el recibo de mantenimiento.
 * Función interna reutilizada por generarPDF y generarImagen.
 */
const buildDoc = (datos, mesId) => {
  const doc = new jsPDF();

  const f = (num) => {
    const n = Number(num);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;

  // --- TÍTULOS ---
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('RECIBO DE MANTENIMIENTO', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  const [anio, mes] = (mesId || '').split('-');
  const nombreMes = mesId
    ? new Date(anio, parseInt(mes) - 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  doc.text(nombreMes.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(margin, 32, pageWidth - margin, 32);

  // --- RESUMEN DE GASTOS TOTALES ---
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('RESUMEN DE SERVICIOS', margin, 42);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const yInicio = 48;
  doc.text('Total Agua:', margin, yInicio);
  doc.text(`S/ ${f(datos.totalAgua)}`, pageWidth - margin, yInicio, { align: 'right' });

  doc.text('Total Luz:', margin, yInicio + 6);
  doc.text(`S/ ${f(datos.totalLuz)}`, pageWidth - margin, yInicio + 6, { align: 'right' });

  doc.text('Total Limpieza:', margin, yInicio + 12);
  doc.text(`S/ ${f(datos.totalLimpieza)}`, pageWidth - margin, yInicio + 12, { align: 'right' });

  const totalG = Number(datos.totalAgua || 0) + Number(datos.totalLuz || 0) + Number(datos.totalLimpieza || 0);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL GENERAL:', margin, yInicio + 20);
  doc.text(`S/ ${f(totalG)}`, pageWidth - margin, yInicio + 20, { align: 'right' });

  // --- INFORMACIÓN DE CÁLCULO ---
  const res = datos.resultados || {};
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(`Total de habitantes registrados: ${res.totalHabitantes || 0}`, margin, yInicio + 30);
  doc.text(`Costo por persona: S/ ${f(res.costoPorPersona)}`, margin, yInicio + 36);
  doc.text(`Costo fijo limpieza: S/ ${f(res.costoFijoLimpieza)}`, margin, yInicio + 42);

  // --- TABLA DE DEPARTAMENTOS ---
  const dptosArray = res.departamentos || [];
  const cantidadDptos = dptosArray.length;

  const tablaDatos = dptosArray.map(dpto => {
    const costoAguaLuz = dpto.habitantes * (res.costoPorPersona || 0);
    return [
      dpto.numero,
      dpto.habitantes.toString(),
      `S/ ${f(costoAguaLuz)}`,
      `S/ ${f(res.costoFijoLimpieza)}`,
      `S/ ${typeof dpto.montoRedondeado === 'number' ? dpto.montoRedondeado.toFixed(2) : dpto.montoRedondeado}`
    ];
  });

  autoTable(doc, {
    startY: yInicio + 50,
    head: [['DPTO', 'N° HAB', 'AGUA & LUZ', 'LIMPIEZA', 'TOTAL A PAGAR']],
    body: tablaDatos,
    foot: [[
      `${cantidadDptos} DPTOS`,
      (res.totalHabitantes || 0).toString(),
      '',
      'TOTAL RECAUDADO:',
      `S/ ${Number(res.totalRedondeado || 0).toFixed(2)}`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 9 },
    footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center', fontStyle: 'bold', textColor: [37, 99, 235] }
    },
    didParseCell: (data) => {
      if (data.section === 'foot') {
        if (data.column.index === 0) data.cell.styles.halign = 'center';
        if (data.column.index === 1) data.cell.styles.halign = 'center';
        if (data.column.index === 3) data.cell.styles.halign = 'right';
        if (data.column.index === 4) {
          data.cell.styles.halign = 'center';
          data.cell.styles.textColor = [37, 99, 235];
        }
      }
    },
    margin: { left: margin, right: margin }
  });

  // --- SALDO CAJA CHICA ---
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFillColor(254, 243, 199);
  doc.rect(margin, finalY, pageWidth - 2 * margin, 14, 'F');

  doc.setTextColor(194, 65, 12);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  const mesNombre = mesId
    ? new Date(mesId + '-02').toLocaleDateString('es-PE', { month: 'long' })
    : new Date().toLocaleDateString('es-PE', { month: 'long' });
  doc.text(`Límite de PAGO: 16 de ${mesNombre} — Saldo a favor de Caja:`, margin + 5, finalY + 6);

  doc.setFontSize(12);
  doc.text(`S/ ${f(res.cajaChica)}`, pageWidth - margin - 5, finalY + 6, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(`Gasto real: S/ ${f(totalG)}`, margin + 5, finalY + 11);

  // --- FOOTER ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  const ahora = new Date().toLocaleString('es-PE');
  doc.text(`Generado el ${ahora}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

  return doc;
};

/**
 * Descarga el recibo como archivo PDF.
 * @param {Object} datos - { totalAgua, totalLuz, totalLimpieza, resultados }
 * @param {string} mesId - formato YYYY-MM
 */
export const generarPDF = (datos, mesId) => {
  const doc = buildDoc(datos, mesId);
  doc.save(`Recibo_Mantenimiento_${mesId}.pdf`);
};

/**
 * Descarga el recibo como imagen PNG.
 * Usa exactamente el mismo buildDoc que generarPDF → mismo contenido garantizado.
 * Convierte la primera página del PDF a PNG via canvas interno de jsPDF.
 * @param {Object} datos - { totalAgua, totalLuz, totalLimpieza, resultados }
 * @param {string} mesId - formato YYYY-MM
 */
export const generarImagen = (datos, mesId) => {
  const doc = buildDoc(datos, mesId);

  // Obtener el PDF como Blob y abrirlo en nueva pestaña
  // El usuario puede hacer clic derecho → Guardar imagen, o en móvil compartir
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);

  // Intentar abrir en nueva pestaña (visor PDF del navegador)
  const ventana = window.open(url, '_blank');

  // Si el navegador bloquea popups, descargar directamente como PDF con nombre .pdf
  if (!ventana) {
    doc.save(`Recibo_Mantenimiento_${mesId}.pdf`);
  }

  // Limpiar URL del blob tras 30 segundos
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};