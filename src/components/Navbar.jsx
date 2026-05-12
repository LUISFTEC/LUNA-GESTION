import { useState, useEffect } from 'react';
import { Building2, History, Shield } from 'lucide-react';

export const Navbar = ({ 
  mostrarAdmin, 
  setMostrarAdmin, 
  mostrarHistorial, 
  onVerHistorial, 
  onVolverInicio 
}) => {
  const [tiempo, setTiempo] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTiempo(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formato directo: "12 mayo 2026 | 10:05:14"
  const fechaDirecta = tiempo.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).replace(/ de /g, ' '); // Quitamos los "de" para que sea "12 mayo 2026"

  const horaDirecta = tiempo.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Título y Fecha/Hora debajo */}
          <button 
            onClick={onVolverInicio}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
          >
            <Building2 className="w-6 h-6 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                LUNA GESTIÓN
              </h1>
              {/* Fecha y hora resumida en text-sm */}
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {fechaDirecta} <span className="mx-1 text-gray-300">|</span> {horaDirecta}
              </p>
            </div>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onVerHistorial}
              className={`p-2 rounded-lg transition-colors ${
                mostrarHistorial ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <History className="w-6 h-6" />
            </button>

            <button
              onClick={() => setMostrarAdmin(!mostrarAdmin)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Shield className={`w-6 h-6 ${mostrarAdmin ? 'text-red-600' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};