import React, { useState } from 'react';
import { Shield, Trash2, UnlockKeyhole, AlertTriangle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const VistaAdministrador = ({ 
  departamentos, 
  datosMes,
  onEliminarDepartamento, 
  onReabrirMes, 
  loading 
}) => {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(null);
  
  const handleEliminar = async (numeroDpto) => {
    if (mostrarConfirmacion === numeroDpto) {
      await onEliminarDepartamento(numeroDpto);
      setMostrarConfirmacion(null);
    } else {
      setMostrarConfirmacion(numeroDpto);
      setTimeout(() => setMostrarConfirmacion(null), 3000);
    }
  };
  
  const handleReabrir = async () => {
    if (mostrarConfirmacion === 'reabrir') {
      await onReabrirMes();
      setMostrarConfirmacion(null);
    } else {
      setMostrarConfirmacion('reabrir');
      setTimeout(() => setMostrarConfirmacion(null), 3000);
    }
  };
  
  const mesCerrado = datosMes?.estado === 'cerrado';
  
  return (
    <Card className="border-2 border-red-200">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-red-600" />
        <h2 className="text-lg font-bold text-red-800">Panel de Administrador</h2>
      </div>
      
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800 font-medium">
              Zona de Administración
            </p>
            <p className="text-xs text-red-700 mt-1">
              Las acciones aquí son irreversibles. Usar con precaución.
            </p>
          </div>
        </div>
      </div>
      
      {/* Reabrir Mes */}
      {mesCerrado && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Reabrir Mes</h3>
          <p className="text-sm text-gray-600 mb-3">
            Esto permitirá volver a editar habitantes y recalcular el mes.
          </p>
          <Button
            onClick={handleReabrir}
            disabled={loading}
            variant={mostrarConfirmacion === 'reabrir' ? 'danger' : 'secondary'}
            className="w-full flex items-center justify-center gap-2"
          >
            <UnlockKeyhole className="w-4 h-4" />
            {mostrarConfirmacion === 'reabrir' ? '¿Confirmar reapertura?' : 'Reabrir Mes'}
          </Button>
        </div>
      )}
      
      {/* Limpiar Registros */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">Limpiar Registros</h3>
        <p className="text-sm text-gray-600 mb-3">
          Eliminar el registro de habitantes de un departamento.
        </p>
        
        {departamentos.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No hay departamentos registrados
          </p>
        ) : (
          <div className="space-y-2">
            {departamentos.map(dpto => (
              <div 
                key={dpto.numero}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div>
                  <span className="font-medium">Dpto. {dpto.numero}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({dpto.habitantes} habitantes)
                  </span>
                </div>
                <Button
                  onClick={() => handleEliminar(dpto.numero)}
                  disabled={loading}
                  variant={mostrarConfirmacion === dpto.numero ? 'danger' : 'secondary'}
                  className="flex items-center gap-1 text-sm py-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {mostrarConfirmacion === dpto.numero ? 'Confirmar' : 'Eliminar'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};