import React, { useState } from 'react';
import { authAPI } from '../services/api';
import ferrexpress from '../ferrexpress.png'; // Ajusta la ruta si está en src/assets

const LoginForm = ({ setCurrentUser, setCurrentView }) => {
  const [email, setEmail] = useState('admin@ferreteria.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Intentando login...');
      const data = await authAPI.login(email, password);

      if (data.success && data.user) {
        console.log('✅ Login exitoso');
        setCurrentUser(data.user);
        setCurrentView('dashboard');
        setError('');
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${ferrexpress})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 0px', // Ajustar el valor  
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="bg-white/80 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          Ferretería - Sistema de Inventario
        </h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Usuarios de prueba:</p>
          <p>admin@ferreteria.com / admin123</p>
          <p>juan@ferreteria.com / juan123</p>
          <p>maria@ferreteria.com / maria123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;