import React from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = ({ productos, ventas, proveedores, loading }) => {
  // Productos con stock bajo (por debajo del mínimo)
  const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo);
  
  // Ventas del día
  const ventasHoy = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha).toDateString();
    const fechaHoy = new Date().toDateString();
    return fechaVenta === fechaHoy;
  });

  const ventasCompletadas = ventasHoy.filter(v => v.estado === 'completada');
  const ventasCanceladas = ventasHoy.filter(v => v.estado === 'cancelada');

  // Calcular ingresos
  const ingresosTotales = ventasCompletadas.reduce((total, v) => total + v.total, 0);
  const ingresosCancelados = ventasCanceladas.reduce((total, v) => total + v.total, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>
      
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Productos</h3>
              <p className="text-2xl font-bold text-blue-600">{productos.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">En Stock</h3>
              <p className="text-2xl font-bold text-green-600">{productos.filter(p => p.stock > 0).length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ventas Hoy</h3>
              <p className="text-2xl font-bold text-purple-600">{ventasCompletadas.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Proveedores</h3>
              <p className="text-2xl font-bold text-orange-600">{proveedores.length}</p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos con stock bajo */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-600">Productos con Stock Bajo</h3>
          </div>
          
          {productosStockBajo.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-green-600 font-medium">¡Excelente!</p>
              <p className="text-gray-500">Todos los productos tienen stock suficiente</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {productosStockBajo.map(producto => (
                <div key={producto.id} className="flex justify-between items-center p-3 bg-red-50 rounded-md border-l-4 border-red-500">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{producto.nombre}</p>
                    <p className="text-sm text-gray-600">{producto.codigo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold">Stock: {producto.stock}</p>
                    <p className="text-sm text-gray-500">Mín: {producto.stockMinimo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ventas del día */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Ventas del Día</h3>
          </div>
          
          {ventasHoy.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay ventas registradas hoy</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {ventasHoy.map(venta => (
                  <div key={venta.id} className={`flex justify-between items-center p-3 rounded-md border-l-4 ${
                    venta.estado === 'completada' 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Venta #{venta.id}</p>
                      <p className="text-sm text-gray-600">{venta.vendedor}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(venta.fecha).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        venta.estado === 'completada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${typeof venta.total === 'number' && !isNaN(venta.total)
    ? venta.total.toFixed(2)
    : parseFloat(venta.total) ? parseFloat(venta.total).toFixed(2) : '0.00'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        venta.estado === 'completada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {venta.estado === 'completada' ? 'Completada' : 'Cancelada'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completadas:</span>
                    <span className="font-bold text-green-600">
                      ${typeof ingresosTotales === 'number' && !isNaN(ingresosTotales)
    ? ingresosTotales.toFixed(2)
    : parseFloat(ingresosTotales) ? parseFloat(ingresosTotales).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Canceladas:</span>
                    <span className="font-bold text-red-600">
                      ${typeof ingresosCancelados === 'number' && !isNaN(ingresosCancelados)
    ? ingresosCancelados.toFixed(2)
    : parseFloat(ingresosCancelados) ? parseFloat(ingresosCancelados).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total del día:</span>
                    <span className="text-blue-600">
                      ${typeof ingresosTotales === 'number' && !isNaN(ingresosTotales)
    ? ingresosTotales.toFixed(2)
    : parseFloat(ingresosTotales) ? parseFloat(ingresosTotales).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Alertas importantes */}
      {productosStockBajo.length > 0 && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Atención requerida
              </h3>
              <p className="text-sm text-yellow-700">
                Tienes {productosStockBajo.length} producto(s) con stock bajo. 
                Considera realizar pedidos a los proveedores.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;