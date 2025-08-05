import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UsuariosView from './components/UsuariosView';
import ProductosView from './components/ProductosView';
import ProveedoresView from './components/ProveedoresView';
import CategoriasView from './components/CategoriasView';
import VentasView from './components/VentasView';
import HistorialVentasView from './components/HistorialVentasView';
import CorteView from './components/CorteView';
import { apiRequest } from './services/api';

const App = () => {
  // Estados principales
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [users, setUsers] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Verificar acceso según rol
  const checkAccess = (view) => {
    // Permitir acceso a login sin restricciones
    if (view === 'login') return true;
    
    // Si no hay usuario logueado, solo permitir login
    if (!currentUser) return view === 'login';
    
    const adminOnlyViews = ['usuarios', 'proveedores'];
    
    if (adminOnlyViews.includes(view) && currentUser.rol !== 'admin') {
      return false;
    }
    
    return true;
  };

  // Redirigir si no tiene acceso (pero no cuando está en login)
  useEffect(() => {
    if (currentUser && currentView !== 'login' && !checkAccess(currentView)) {
      setCurrentView('dashboard');
      alert('No tienes permisos para acceder a esta sección');
    }
  }, [currentUser, currentView]);

  // Cargar datos iniciales cuando el usuario se loguea
  useEffect(() => {
    if (currentUser && currentUser.token) {
      loadInitialData();
    }
  }, [currentUser]);

  const loadInitialData = async () => {
    try {
      console.log('🔄 Cargando datos desde el API...');
      setLoading(true);
      
      // Cargar datos básicos para todos los usuarios
      const basicRequests = [
        apiRequest('/categorias', {}, currentUser.token),
        apiRequest('/productos', {}, currentUser.token),
        apiRequest('/ventas', {}, currentUser.token)
      ];

      // Cargar datos adicionales solo para admins
      const adminRequests = currentUser.rol === 'admin' ? [
        apiRequest('/users', {}, currentUser.token),
        apiRequest('/proveedores', {}, currentUser.token)
      ] : [Promise.resolve([]), Promise.resolve([])];

      const [categoriasData, productosData, ventasData, usersData, proveedoresData] = await Promise.all([
        ...basicRequests,
        ...adminRequests
      ]);

      setCategorias(categoriasData || []);
      setProductos(productosData || []);
      setVentas(ventasData || []);
      
      if (currentUser.rol === 'admin') {
        setUsers(usersData || []);
        setProveedores(proveedoresData || []);
      }
      
      console.log('✅ Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      alert('Error al cargar los datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar vista con verificación de acceso
  const handleViewChange = (view) => {
    if (checkAccess(view)) {
      setCurrentView(view);
    } else {
      alert('No tienes permisos para acceder a esta sección');
    }
  };

  // Props comunes para todos los componentes
  const commonProps = {
    currentUser,
    users,
    setUsers,
    proveedores,
    setProveedores,
    categorias,
    setCategorias,
    productos,
    setProductos,
    ventas,
    setVentas,
    carrito,
    setCarrito,
    searchTerm,
    setSearchTerm,
    showModal,
    setShowModal,
    modalType,
    setModalType,
    editingItem,
    setEditingItem,
    selectedDate,
    setSelectedDate,
    loading,
    setLoading,
    loadInitialData
  };

  // Función para renderizar la vista actual
  const renderCurrentView = () => {
    // No verificar acceso para login
    if (currentView === 'login') {
      return (
        <LoginForm 
          setCurrentUser={setCurrentUser} 
          setCurrentView={setCurrentView}
        />
      );
    }

    // Verificar acceso antes de renderizar otras vistas
    if (!checkAccess(currentView)) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Acceso Denegado</h2>
              <p className="text-red-600">No tienes permisos para acceder a esta sección.</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'usuarios':
        return currentUser?.rol === 'admin' ? <UsuariosView {...commonProps} /> : null;
      case 'productos':
        return <ProductosView {...commonProps} />;
      case 'proveedores':
        return currentUser?.rol === 'admin' ? <ProveedoresView {...commonProps} /> : null;
      case 'categorias':
        return <CategoriasView {...commonProps} />;
      case 'ventas':
        return <VentasView {...commonProps} />;
      case 'historial':
        return <HistorialVentasView {...commonProps} />;
      case 'corte':
        return <CorteView {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  // Si está en login, mostrar solo login
  if (currentView === 'login') {
    return renderCurrentView();
  }

  // Layout principal con sidebar
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setCurrentView={setCurrentView}
        setCarrito={setCarrito}
      />
      <div className="flex">
        <Sidebar 
          currentView={currentView}
          setCurrentView={handleViewChange}
          currentUser={currentUser}
        />
        <div className="flex-1">
          {renderCurrentView()}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg">
                <p>Cargando...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );  
};

export default App;