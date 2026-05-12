import { Card } from './ui/Card';

export const TablaResultados = ({ resultados }) => {
  if (!resultados || !resultados.departamentos || resultados.departamentos.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-4">
          No hay resultados para mostrar
        </p>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-x-auto p-0 overflow-hidden border border-gray-200 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          {/* Encabezado limpio y suave (Gris clarito) */}
          <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-700">
            <th className="py-3 px-2 text-center font-semibold">DPTO</th>
            <th className="py-3 px-2 text-center font-semibold">N° HAB</th>
            <th className="py-3 px-2 text-center font-semibold">AGUA & LUZ</th>
            <th className="py-3 px-2 text-center font-semibold">LIMPIEZA</th>
            <th className="py-3 px-2 text-center font-bold text-blue-700">TOTAL A PAGAR</th>
          </tr>
        </thead>
        <tbody>
          {resultados.departamentos.map((dpto) => (
            <tr 
              key={dpto.numero} 
              // Fondo blanco con un hover gris muy sutil
              className="border-b border-gray-100 bg-white hover:bg-slate-50 transition-colors"
            >
              <td className="py-3 px-2 text-center font-bold text-slate-700">{dpto.numero}</td>
              <td className="py-3 px-2 text-center text-slate-600">{dpto.habitantes}</td>
              <td className="py-3 px-2 text-center text-slate-600">
                S/ {dpto.costoAguaLuz ? dpto.costoAguaLuz.toFixed(2) : '0.00'}
              </td>
              <td className="py-3 px-2 text-center text-slate-600">
                S/ {dpto.costoLimpieza ? dpto.costoLimpieza.toFixed(2) : '0.00'}
              </td>
              {/* La columna del total tiene un fondito celeste casi transparente para resaltar */}
              <td className="py-3 px-2 text-center font-bold text-blue-700 bg-blue-50/50">
                S/ {dpto.montoRedondeado}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {/* Pie de tabla limpio */}
          <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-700">
            <td className="py-3 px-2 text-center text-xs text-slate-500">{resultados.totalDptos} DPTOS</td>
            <td className="py-3 px-2 text-center">{resultados.totalHabitantes}</td>
            <td colSpan="2" className="py-3 px-2 text-right pr-4 text-slate-600">TOTAL RECAUDADO:</td>
            <td className="py-3 px-2 text-center text-blue-700 text-base">
              S/ {resultados.totalRedondeado}
            </td>
          </tr>
        </tfoot>
      </table>
      
      {/* Caja Chica (Colores ámbar muy suaves, sin bordes toscos) */}
      <div className="m-4 p-4 bg-orange-50 border border-orange-100 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold text-orange-900 block">Saldo a favor de Caja:</span>
            <span className="text-xs text-orange-700">Gasto real: S/ {resultados.totalServicios ? resultados.totalServicios.toFixed(2) : '0.00'}</span>
          </div>
          <span className="text-xl font-bold text-orange-600">
            S/ {resultados.cajaChica ? resultados.cajaChica.toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
    </Card>
  );
};