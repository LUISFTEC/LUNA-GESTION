import { Download, Calendar, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { generarPDF } from '../utils/generarPDF';

export const Historial = ({ historial, onClose }) => {
  return (
    <Card className="mb-4 border-blue-200 bg-white shadow-lg animate-fadeIn">
      {/* Encabezado con botón para cerrar */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" /> 
          Historial de Recibos
        </h2>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid gap-2">
        {historial.length === 0 ? (
          <p className="text-center py-4 text-xs text-gray-500">No hay registros guardados.</p>
        ) : (
          historial.map((mes) => {
            const fechaLegible = new Date(mes.id + '-02').toLocaleDateString('es-PE', { 
              month: 'long', 
              year: 'numeric' 
            });
            // Datos del mes para pasar a generarPDF y generarImagen
            const datosMes = {
              totalAgua: mes.totalAgua || 0,
              totalLuz: mes.totalLuz || 0,
              totalLimpieza: mes.totalLimpieza || 0,
              resultados: mes
            };

            return (
              <div 
                key={mes.id} 
                className="flex items-center justify-between gap-2 p-2 border border-gray-100 rounded-lg hover:bg-blue-50 transition-all"
              >
                <span className="font-bold text-gray-700 text-xs uppercase flex-1">
                  {fechaLegible}
                </span>
                
                <div className="flex gap-1">
                  <Button 
                    onClick={() => generarPDF(datosMes, mes.id)}
                    className="h-8 px-4 text-[10px] bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> 
                    <span>DESCARGAR PDF</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};