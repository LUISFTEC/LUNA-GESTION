import { useState } from 'react';
import { Lock, X, User } from 'lucide-react'; 
import { Button } from './ui/Button';

// ---> NUEVO: Importamos las funciones de autenticación de Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase'; // <-- Asegúrate de que esta ruta apunte a tu archivo firebase.js

export const LoginModal = ({ isOpen, onClose, onConfirm }) => {
  // ---> MODIFICADO: Cambié 'usuario' por 'email' porque Firebase Auth usa correos por defecto
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  // ---> NUEVO: Estado para saber si está cargando y bloquear el botón
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // ---> MODIFICADO: Agregué 'async' porque la conexión a Firebase toma tiempo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true); // Empezamos a cargar
    
    try {
      // ---> NUEVO: Función real de Firebase para verificar el correo y contraseña
      await signInWithEmailAndPassword(auth, email, password);
      
      // Si la línea de arriba no da error, el login fue exitoso:
      onConfirm();
      setEmail('');
      setPassword('');
      setError(false);
    } catch (err) {
      console.error("Error de autenticación:", err);
      // Si la clave o el correo están mal, Firebase lanza un error y caemos aquí
      setError(true);
    } finally {
      // ---> NUEVO: Terminamos de cargar, haya habido error o no
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-primary-600 font-bold text-lg">
              <Lock className="w-5 h-5" />
              <span>Acceso Administrador</span>
            </div>
            {/* ---> MODIFICADO: Deshabilitar el botón de cerrar si está cargando */}
            <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* CAMPO DE USUARIO (CORREO) */}
            <div>
              {/* ---> MODIFICADO: Cambié la etiqueta a Correo para que coincida con Firebase */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo (Usuario)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                {/* ---> MODIFICADO: value ahora es 'email', onChange actualiza 'email' y type es 'email' */}
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg outline-none transition-all ${
                    error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-primary-500'
                  }`}
                  placeholder="Ej: admin@edificio.com"
                  required
                />
              </div>
            </div>

            {/* CAMPO DE CONTRASEÑA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg outline-none transition-all ${
                    error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-primary-500'
                  }`}
                  placeholder="••••••"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2 font-medium">⚠️ Correo o contraseña incorrectos</p>}
            </div>

            {/* ---> MODIFICADO: El botón muestra estado de carga y se bloquea */}
            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};