import { useState } from 'react';
import { Home, Save, CheckCircle, XCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { DEPARTAMENTOS } from '../constants/departamentos';

export const RegistroDepartamento = ({ 
  departamentos, 
  onGuardar, 
  loading, 
  disabled 
}) => {
  const [dptoSeleccionado, setDptoSeleccionado] = useState('');
  const [habitantesInput, setHabitantesInput] = useState(''); // 👈 Cambiado
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  
  // Buscar si el departamento ya está registrado
  const dptoRegistrado = departamentos.find(d => d.numero === dptoSeleccionado);
  const yaTieneRegistro = dptoRegistrado !== undefined;
  
  // ✅ Calcular el valor a mostrar basado en si está registrado
  const valorMostrado = yaTieneRegistro 
    ? dptoRegistrado.habitantes.toString() 
    : habitantesInput;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (yaTieneRegistro) return;
    if (!dptoSeleccionado || habitantesInput === '') return; // '0' es válido
    
    const exito = await onGuardar(dptoSeleccionado, habitantesInput);
    
    if (exito) {
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 3000);
      setDptoSeleccionado('');
      setHabitantesInput('');
    }
  };
  
  const opcionesDepartamentos = DEPARTAMENTOS.map(dpto => ({
    value: dpto,
    label: `Departamento ${dpto}`
  }));
  
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-bold text-gray-800">Registro de Habitantes</h2>
      </div>
      
      {disabled && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ⚠️ El mes está cerrado. No se pueden registrar o modificar habitantes.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Selecciona tu departamento"
          value={dptoSeleccionado}
          onChange={(e) => {
            setDptoSeleccionado(e.target.value);
            setHabitantesInput(''); // Limpiar al cambiar de depto
          }}
          options={opcionesDepartamentos}
          disabled={disabled || loading}
          required
        />
        
        {dptoSeleccionado && (
          <>
            <Input
              label="Número de habitantes"
              type="number"
              value={valorMostrado}
              onChange={(e) => {
                if (!yaTieneRegistro) {
                  setHabitantesInput(e.target.value);
                }
              }}
              min="0"
              step="1"
              placeholder="Ej: 3"
              disabled={disabled || loading || yaTieneRegistro}
              required
            />
            
            {yaTieneRegistro && (
              <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 p-2 rounded">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700 font-medium">
                  ❌ Este departamento ya registró sus habitantes. No se puede modificar.
                </span>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={disabled || loading || habitantesInput === '' || yaTieneRegistro}
              className="w-full flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Registro
            </Button>
          </>
        )}
      </form>
      
      {guardadoExitoso && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">
            ¡Registro guardado exitosamente!
          </p>
        </div>
      )}
      
      {/* Resumen de departamentos registrados */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Departamentos Registrados
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {DEPARTAMENTOS.map(dpto => {
            const registrado = departamentos.find(d => d.numero === dpto);
            return (
              <div
                key={dpto}
                className={`p-2 rounded text-center text-sm ${
                  registrado
                    ? 'bg-green-100 text-green-800 font-medium'
                    : 'bg-red-100 text-red-600 font-medium'
                }`}
              >
                {dpto}
                {registrado ? ` (${registrado.habitantes})` : ' ⚠️ Sin registro'}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};