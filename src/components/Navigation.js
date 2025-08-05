import React from 'react';
import { LogOut } from 'lucide-react';

const Navigation = ({ currentUser, setCurrentUser, setCurrentView, setCarrito }) => {
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      setCurrentUser(null);
      setCurrentView('login');
      setCarrito([]);
      
      // Limpiar localStorage si se está usando
      localStorage.removeItem('ferreteria_user');
      
      console.log('👋 Sesión cerrada');
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          FerreXpress - Sistema de Inventario
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Bienvenido,</span>
            <span className="font-semibold">{currentUser?.nombre}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentUser?.rol === 'admin' 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {currentUser?.rol}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition duration-200"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;