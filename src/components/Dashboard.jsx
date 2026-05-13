import { useState, useEffect } from 'react'; 
import { Users, Receipt, ClipboardCheck } from 'lucide-react'; 
import { useMesActual } from '../hooks/useMesActual';
import { useFirestore } from '../hooks/useFirestore';
import { useCalculoMes } from '../hooks/useCalculoMes';
import { RegistroDepartamento } from './RegistroDepartamento';
import { ReciboGeneral } from './ReciboGeneral';
import { VistaAdministrador } from './VistaAdministrador';
import { Navbar } from './Navbar'; 
import { Historial } from './Historial'; 
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TablaResultados } from './TablaResultados';
import { generarPDF } from '../utils/generarPDF';

// ---> NUEVO: Importamos el modal de login que creaste
import { LoginModal } from './LoginModal'; 

export const Dashboard = () => {
  const mesId = useMesActual();
  const {
    loading, error, datosMes, departamentos,
    guardarHabitantes, reabrirMes, eliminarDepartamento,
    registrarAgua, registrarLuz, registrarLimpieza,
    obtenerHistorialResultados, guardarResultados 
  } = useFirestore(mesId);
  
  const resultados = useCalculoMes(datosMes, departamentos);
  
  const [tabActiva, setTabActiva] = useState('registro');
  const [mostrarAdmin, setMostrarAdmin] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // ---> NUEVO: Estado para controlar si el modal de la contraseña está visible o no
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (resultados && Object.keys(resultados).length > 0) {
      guardarResultados(resultados);
    }
  }, [JSON.stringify(resultados), mesId, guardarResultados]);

  const manejarVolverInicio = () => {
    setMostrarAdmin(false);
    setMostrarHistorial(false);
    setTabActiva('registro');
  };

  const manejarVerHistorial = async () => {
    if (!mostrarHistorial) {
      const data = await obtenerHistorialResultados();
      setHistorial(data);
    }
    setMostrarHistorial(!mostrarHistorial);
    setMostrarAdmin(false); 
  };

  // ---> NUEVO: Función que intercepta el clic en el Navbar (Escudo)
  const manejarClickEscudo = (intentarAbrir) => {
    // Si intentan abrir el modo admin y no está abierto aún, mostramos el modal
    if (intentarAbrir && !mostrarAdmin) {
      setIsLoginOpen(true);
    } else {
      // Si ya estaba abierto, simplemente lo cerramos (como un logout rápido)
      setMostrarAdmin(false);
    }
    setMostrarHistorial(false); // Cerramos el historial por si acaso
  };

  // ---> NUEVO: Función que se ejecuta cuando la contraseña es correcta en el Modal
  const confirmarLogin = () => {
    setIsLoginOpen(false); // Cerramos el cuadrito
    setMostrarAdmin(true); // ¡Activamos la vista de administrador real!
  };

  const nombreMes = mesId ? new Date(mesId + '-01').toLocaleDateString('es-PE', {
    month: 'long', year: 'numeric'
  }) : '';

  const tabs = [
    { id: 'registro', label: 'Personas', icon: Users },
    { id: 'recibos', label: 'Recibos', icon: Receipt },
    { id: 'resultados', label: 'Resultados', icon: ClipboardCheck }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar 
        nombreMes={nombreMes}
        mostrarAdmin={mostrarAdmin}
        // ---> MODIFICADO: Ahora pasamos nuestra nueva función para que pida clave primero
        setMostrarAdmin={manejarClickEscudo} 
        mostrarHistorial={mostrarHistorial}
        onVerHistorial={manejarVerHistorial}
        onVolverInicio={manejarVolverInicio}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-2">
        
        {/* ---> NUEVO: Agregamos el componente Modal justo aquí al inicio del main */}
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onConfirm={confirmarLogin} 
        />

        {mostrarHistorial && (
          <Historial 
            historial={historial} 
            onClose={() => setMostrarHistorial(false)} 
          />
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            ⚠️ Error: {error}
          </div>
        )}
        
        {loading && !datosMes && !mostrarHistorial && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        )}
        
        {mostrarAdmin && (
          <div className="mb-6">
            <VistaAdministrador departamentos={departamentos} datosMes={datosMes} onEliminarDepartamento={eliminarDepartamento} onReabrirMes={reabrirMes} loading={loading} />
          </div>
        )}
        
        {!mostrarAdmin && !mostrarHistorial && datosMes && (
          <>
            <div className="flex gap-2 mb-2 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg font-medium transition-all ${
                      tabActiva === tab.id ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>
            
            <div className="animate-fadeIn">
              {tabActiva === 'registro' && <RegistroDepartamento departamentos={departamentos} onGuardar={guardarHabitantes} loading={loading} disabled={datosMes?.estado === 'cerrado'} />}
              {tabActiva === 'recibos' && <ReciboGeneral registros={datosMes?.recibos} onRegistrarAgua={registrarAgua} onRegistrarLuz={registrarLuz} onRegistrarLimpieza={registrarLimpieza} loading={loading} mesCerrado={datosMes?.estado === 'cerrado'} />}
              {tabActiva === 'resultados' && resultados && (
                <div className="space-y-4">
                  <Card className="bg-blue-50 border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-2">Resumen del Mes</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>Total habitantes: <span className="font-semibold">{resultados.totalHabitantes}</span></p>
                      <p>Costo por persona: <span className="font-semibold">S/ {resultados.costoPorPersona?.toFixed(2)}</span></p>
                      <p>Costo fijo limpieza: <span className="font-semibold">S/ {resultados.costoFijoLimpieza?.toFixed(2)}</span></p>
                    </div>
                  </Card>
                  <TablaResultados resultados={resultados} />
                  <Button onClick={() => generarPDF({ totalAgua: Number(datosMes?.recibos?.agua?.monto || 0), totalLuz: Number(datosMes?.recibos?.luz?.monto || 0), totalLimpieza: Number(datosMes?.recibos?.limpieza?.monto || 0), resultados }, mesId)} variant="primary" className="w-full flex items-center justify-center gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Descargar PDF
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <footer className="max-w-4xl mx-auto px-4 py-3 text-center text-sm text-gray-500">
        <p>Sistema de Gestión de Mantenimiento - Edificio {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};