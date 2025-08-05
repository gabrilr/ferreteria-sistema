import React from 'react';
import { User, Package, Users, Tag, ShoppingCart, Calculator, History, BarChart3 } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, currentUser }) => {
  const menuItems = [
    { id: 'dashboard', icon: BarChart3, text: 'Dashboard', view: 'dashboard', roles: ['admin', 'vendedor'] },
    { id: 'usuarios', icon: User, text: 'Usuarios', view: 'usuarios', roles: ['admin'] },
    { id: 'productos', icon: Package, text: 'Productos', view: 'productos', roles: ['admin', 'vendedor'] },
    { id: 'proveedores', icon: Users, text: 'Proveedores', view: 'proveedores', roles: ['admin'] },
    { id: 'categorias', icon: Tag, text: 'Categorías', view: 'categorias', roles: ['admin', 'vendedor'] },
    { id: 'ventas', icon: ShoppingCart, text: 'Ventas', view: 'ventas', roles: ['admin', 'vendedor'] },
    { id: 'historial', icon: History, text: 'Historial de Ventas', view: 'historial', roles: ['admin', 'vendedor'] },
    { id: 'corte', icon: Calculator, text: 'Corte de Caja', view: 'corte', roles: ['admin', 'vendedor'] },
  ];

  // Filtrar elementos del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser?.rol)
  );

  const SidebarItem = ({ icon: Icon, text, view, isActive }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition duration-200 ${
        isActive 
          ? 'bg-gray-700 text-white shadow-md' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
      title={text}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{text}</span>
    </button>
  );

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen shadow-lg">
      <div className="p-4">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-center text-gray-300 border-b border-gray-700 pb-2">
            Menú Principal
          </h2>
        </div>
        
        <div className="space-y-1">
          {filteredMenuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              text={item.text}
              view={item.view}
              isActive={currentView === item.view}
            />
          ))}
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            <p>Sistema de Ferretería</p>
            <p>v1.0.0</p>
            <p className="mt-2 text-yellow-400">
              {currentUser?.rol === 'admin' ? 'Administrador' : 'Vendedor'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;