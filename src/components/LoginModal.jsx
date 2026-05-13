import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { Button } from './ui/Button';

export const LoginModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '1234') { // <--- AQUÍ defines tu clave
      onConfirm();
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-primary-600 font-bold">
              <Lock className="w-5 h-5" />
              <span>Acceso Restringido</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de Administrador</label>
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
                  error ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-primary-500'
                }`}
                placeholder="••••••"
              />
              {error && <p className="text-red-500 text-xs mt-1">⚠️ Clave incorrecta</p>}
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Entrar al Escudo
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};