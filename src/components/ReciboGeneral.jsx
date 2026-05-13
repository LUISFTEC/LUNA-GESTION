import { useState } from 'react';
import { Droplet, Zap, Brush, Send, CheckCircle, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

// 1. NUEVA FUNCIÓN INTELIGENTE (Fuera del componente para mayor eficiencia)
const autoFormatearMonto = (valor, maxEnteros) => {
  if (valor === '') return '';

  // 👇 ¡ESTO ES LO ÚNICO QUE TE FALTÓ AGREGAR AQUÍ! 👇
  let valorConPunto = valor.replace(',', '.');

  // 👇 Y AQUÍ CAMBIAR "valor" por "valorConPunto" 👇
  let limpio = valorConPunto.replace(/[^0-9.]/g, '');
  
  // Evitar que pongan dos puntos (ej: 12.3.4)
  const partes = limpio.split('.');
  if (partes.length > 2) {
    limpio = partes[0] + '.' + partes.slice(1).join('').replace(/\./g, '');
  }

  let [enteros, decimales] = limpio.split('.');

  // Si se pasan del límite de enteros, forzamos el punto
  if (enteros && enteros.length > maxEnteros) {
    if (decimales === undefined) {
      decimales = enteros.slice(maxEnteros);
    }
    enteros = enteros.slice(0, maxEnteros);
  }

  // Limitar a máximo 2 decimales
  if (decimales !== undefined) {
    decimales = decimales.slice(0, 2);
    return `${enteros}.${decimales}`;
  }

  return enteros;
};








export const ReciboGeneral = ({ 
  registros,
  onRegistrarAgua,
  onRegistrarLuz,
  onRegistrarLimpieza,
  loading,
  mesCerrado
}) => {
  const [montoAgua, setMontoAgua] = useState('');
  const [montoLuz, setMontoLuz] = useState('');
  const [montoLimpieza, setMontoLimpieza] = useState('');
  const [guardadoExitoso, setGuardadoExitoso] = useState({ agua: false, luz: false, limpieza: false });
  
  // Verificar si cada servicio ya está registrado
  const aguaRegistrado = registros?.agua?.monto;
  const luzRegistrado = registros?.luz?.monto;
  const limpiezaRegistrado = registros?.limpieza?.monto;
  
  const todosRegistrados = aguaRegistrado && luzRegistrado && limpiezaRegistrado;
  
  const handleRegistrarAgua = async () => {
    if (!montoAgua) return;
    const exito = await onRegistrarAgua(parseFloat(montoAgua));
    if (exito) {
      setGuardadoExitoso(prev => ({ ...prev, agua: true }));
      setMontoAgua('');
      setTimeout(() => setGuardadoExitoso(prev => ({ ...prev, agua: false })), 3000);
    }
  };
  
  const handleRegistrarLuz = async () => {
    if (!montoLuz) return;
    const exito = await onRegistrarLuz(parseFloat(montoLuz));
    if (exito) {
      setGuardadoExitoso(prev => ({ ...prev, luz: true }));
      setMontoLuz('');
      setTimeout(() => setGuardadoExitoso(prev => ({ ...prev, luz: false })), 3000);
    }
  };
  
  const handleRegistrarLimpieza = async () => {
    if (!montoLimpieza) return;
    const exito = await onRegistrarLimpieza(parseFloat(montoLimpieza));
    if (exito) {
      setGuardadoExitoso(prev => ({ ...prev, limpieza: true }));
      setMontoLimpieza('');
      setTimeout(() => setGuardadoExitoso(prev => ({ ...prev, limpieza: false })), 3000);
    }
  };
  
  return (
    <div className="space-y-4">
      
      {/* ========== AGUA ========== */}
      <Card className={aguaRegistrado ? 'bg-green-50' : ''}>
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">Recibo de Agua</h2>
        </div>
        
        {aguaRegistrado ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-lg">S/ {aguaRegistrado.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Registrado el {new Date(registros?.agua?.fecha).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-green-100 border border-green-200 p-2 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                ✅ Agua ya registrada. No se puede modificar.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label="Monto del recibo de agua (S/)"
              type="number"
              inputMode="decimal"     
              step="0.01"             // ✅ PERMITE DECIMALES         
              value={montoAgua}
              // REGLA: Límite de 3 enteros
              onChange={(e) => setMontoAgua(autoFormatearMonto(e.target.value, 3))}
              placeholder="0.00"
              disabled={loading || mesCerrado}
            />
            <Button
              onClick={handleRegistrarAgua}
              disabled={!montoAgua || loading || mesCerrado}
              className="w-full"
              variant="primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Registrar Agua
            </Button>
            {guardadoExitoso.agua && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800">¡Agua registrada exitosamente!</p>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* ========== LUZ ========== */}
      <Card className={luzRegistrado ? 'bg-green-50' : ''}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-bold text-gray-800">Recibo de Luz</h2>
        </div>
        
        {luzRegistrado ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-lg">S/ {luzRegistrado.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Registrado el {new Date(registros?.luz?.fecha).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-green-100 border border-green-200 p-2 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                ✅ Luz ya registrada. No se puede modificar.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label="Monto del recibo de luz (S/)"
              type="number"
              inputMode="decimal"   
              step="0.01"             // ✅ PERMITE DECIMALES           
              value={montoLuz}
              // REGLA: Límite de 2 enteros
              onChange={(e) => setMontoLuz(autoFormatearMonto(e.target.value, 2))}
              placeholder="0.00"
              disabled={loading || mesCerrado}
            />
            <Button
              onClick={handleRegistrarLuz}
              disabled={!montoLuz || loading || mesCerrado}
              className="w-full"
              variant="primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Registrar Luz
            </Button>
            {guardadoExitoso.luz && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800">¡Luz registrada exitosamente!</p>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* ========== LIMPIEZA ========== */}
      <Card className={limpiezaRegistrado ? 'bg-green-50' : ''}>
        <div className="flex items-center gap-2 mb-4">
          <Brush className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-800">Recibo de Limpieza</h2>
        </div>
        
        {limpiezaRegistrado ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-lg">S/ {limpiezaRegistrado.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Registrado el {new Date(registros?.limpieza?.fecha).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-green-100 border border-green-200 p-2 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                ✅ Limpieza ya registrada. No se puede modificar.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label="Monto del recibo de limpieza (S/)"
              type="number"
              inputMode="decimal" 
              step="0.01"             // ✅ PERMITE DECIMALES           
              value={montoLimpieza}
              // REGLA: Límite de 3 enteros
              onChange={(e) => setMontoLimpieza(autoFormatearMonto(e.target.value, 3))}
              placeholder="0.00"
              disabled={loading || mesCerrado}
            />
            <Button
              onClick={handleRegistrarLimpieza}
              disabled={!montoLimpieza || loading || mesCerrado}
              className="w-full"
              variant="primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Registrar Limpieza
            </Button>
            {guardadoExitoso.limpieza && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800">¡Limpieza registrada exitosamente!</p>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Mensaje cuando todo está registrado */}
      {todosRegistrados && !mesCerrado && (
        <Card className="bg-green-100 border-green-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-700" />
            <div>
              <p className="font-bold text-green-800">✅ Todos los recibos registrados</p>
              <p className="text-sm text-green-700">El mes se ha cerrado automáticamente</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};