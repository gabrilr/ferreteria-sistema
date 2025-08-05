import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, Search, ShoppingCart, Package } from 'lucide-react';
import { ventasAPI } from '../services/api';

const VentasView = ({ 
  currentUser,
  productos, 
  setProductos,
  ventas,
  setVentas,
  carrito, 
  setCarrito,
  loading,
  setLoading
}) => {
  const [productoBusqueda, setProductoBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [showProductos, setShowProductos] = useState(false);

  useEffect(() => {
    if (productoBusqueda.trim()) {
      const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(productoBusqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(productoBusqueda.toLowerCase())
      ).slice(0, 10); // Limitar max 10.
      setProductosFiltrados(filtrados);
      setShowProductos(true);
    } else {
      setShowProductos(false);
      setProductosFiltrados([]);
    }
  }, [productoBusqueda, productos]);

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        setCarrito(carrito.map(item => 
          item.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      } else {
        alert('Stock insuficiente');
      }
    } else {
      if (producto.stock > 0) {
        setCarrito([...carrito, { ...producto, cantidad: 1 }]);
      } else {
        alert('Producto sin stock');
      }
    }
    
    setProductoBusqueda('');
    setShowProductos(false);
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    const producto = productos.find(p => p.id === id);
    
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(item => item.id !== id));
    } else if (nuevaCantidad <= producto.stock) {
      setCarrito(carrito.map(item => 
        item.id === id 
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    } else {
      alert(`Stock insuficiente. Máximo disponible: ${producto.stock}`);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    
    setLoading(true);
    
    try {
      const ventaData = {
        vendedor: currentUser.nombre,
        productos: carrito.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio: item.precio
        })),
        total: calcularTotal()
      };

      console.log('📦 Procesando venta:', ventaData);
      const response = await ventasAPI.create(ventaData, currentUser.token);

      if (response.success) {
        // Actualizar lista de ventas
        setVentas([response.venta, ...ventas]);
        
        // Actualizar stock de productos localmente
        const productosActualizados = productos.map(producto => {
          const itemCarrito = carrito.find(item => item.id === producto.id);
          if (itemCarrito) {
            return { ...producto, stock: producto.stock - itemCarrito.cantidad };
          }
          return producto;
        });
        setProductos(productosActualizados);
        
        // Limpiar carrito
        setCarrito([]);
        alert('Venta procesada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al procesar venta:', error);
      alert(`Error al procesar la venta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpiarCarrito = () => {
    if (carrito.length > 0 && window.confirm('¿Estás seguro de que deseas limpiar el carrito?')) {
      setCarrito([]);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Punto de Venta</h2>
        <p className="text-gray-600">Procesa las ventas de productos</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de búsqueda de productos */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <Search className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Buscar Productos</h3>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={productoBusqueda}
              onChange={(e) => setProductoBusqueda(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar por nombre o código del producto..."
              disabled={loading}
            />
            
            {showProductos && productosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {productosFiltrados.map(producto => (
                  <div
                    key={producto.id}
                    onClick={() => agregarAlCarrito(producto)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">{producto.codigo}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${typeof producto.precio === 'number' && !isNaN(producto.precio)
    ? producto.precio.toFixed(2)
    : parseFloat(producto.precio) ? parseFloat(producto.precio).toFixed(2) : '0.00'}</p>
                        <p className={`text-sm ${
                          producto.stock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Stock: {producto.stock}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showProductos && productosFiltrados.length === 0 && productoBusqueda.trim() && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4">
                <div className="text-center text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <p>No se encontraron productos</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>💡 Tip: Puedes buscar por nombre o código del producto</p>
          </div>
        </div>

        {/* Carrito de compras */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Carrito de Compras</h3>
            </div>
            {carrito.length > 0 && (
              <button
                onClick={limpiarCarrito}
                className="text-red-600 hover:text-red-700 text-sm"
                title="Limpiar carrito"
              >
                Limpiar
              </button>
            )}
          </div>
          
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">El carrito está vacío</p>
              <p className="text-gray-400 text-sm">Busca productos para agregar a la venta</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items del carrito */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {carrito.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.nombre}</p>
                      <p className="text-sm text-gray-500">
                        ${typeof item.precio === 'number' && !isNaN(item.precio)
    ? item.precio.toFixed(2)
    : parseFloat(item.precio) ? parseFloat(item.precio).toFixed(2) : '0.00'} c/u
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center transition duration-200"
                          disabled={loading}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-10 text-center font-medium">{item.cantidad}</span>
                        
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          className="w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center transition duration-200"
                          disabled={loading}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Eliminar item */}
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="w-8 h-8 bg-gray-500 text-white rounded-full hover:bg-gray-600 flex items-center justify-center transition duration-200"
                        disabled={loading}
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="text-right ml-4 min-w-0">
                      <p className="font-bold text-gray-900">
                        ${typeof item.precio === 'number' && !isNaN(item.precio)
    ? (item.precio * item.cantidad).toFixed(2)
    : (parseFloat(item.precio) * item.cantidad) ? (parseFloat(item.precio) * item.cantidad).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Resumen del carrito */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Items en carrito:</span>
                  <span className="font-medium">{carrito.length}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Cantidad total:</span>
                  <span className="font-medium">
                    {carrito.reduce((total, item) => total + item.cantidad, 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                  <span>Total a pagar:</span>
                  <span className="text-green-600">${calcularTotal().toFixed(2)}</span>
                </div>
                
                {/* Botón de procesar venta */}
                <button
                  onClick={procesarVenta}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
                  disabled={loading || carrito.length === 0}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Procesar Venta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información importante
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>El stock se actualiza automáticamente después de procesar la venta</li>
                <li>Puedes modificar las cantidades antes de procesar la venta</li>
                <li>Los productos sin stock no pueden agregarse al carrito</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentasView;