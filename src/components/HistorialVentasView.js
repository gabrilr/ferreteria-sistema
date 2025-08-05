import React, { useState, useEffect } from 'react';
import { Eye, X, Calendar, TrendingUp, TrendingDown, BarChart } from 'lucide-react';
import Modal from './common/Modal';
import { ventasAPI } from '../services/api';

const HistorialVentasView = ({ 
  currentUser,
  ventas, 
  setVentas,
  productos,
  setProductos,
  selectedDate, 
  setSelectedDate,
  loading,
  setLoading
}) => {
  const [ventasFiltradas, setVentasFiltradas] = useState(ventas);
  const [mostrarDetalle, setMostrarDetalle] = useState(null);

  // Filtrar ventas por fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      const ventasDelDia = ventas.filter(v => {
        const fechaVenta = new Date(v.fecha);
        const yyyy = fechaVenta.getFullYear();
        const mm = String(fechaVenta.getMonth() + 1).padStart(2, '0');
        const dd = String(fechaVenta.getDate()).padStart(2, '0');
        const ventaDateStr = `${yyyy}-${mm}-${dd}`;
        return ventaDateStr === selectedDate;
      });
      setVentasFiltradas(ventasDelDia);
      console.log('Ventas del día:', ventasDelDia); // <-- Verifica aquí
    } else {
      setVentasFiltradas(ventas);
    }
  }, [selectedDate, ventas]);

  const cancelarVenta = async (ventaId) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta venta? Esta acción no se puede deshacer.')) {
      setLoading(true);
      try {
        const response = await ventasAPI.cancel(ventaId, currentUser.token);

        if (response.success) {
          // Actualizar lista de ventas
          const ventasActualizadas = ventas.map(venta => 
            venta.id === ventaId 
              ? { ...venta, estado: 'cancelada' }
              : venta
          );
          setVentas(ventasActualizadas);
          
          // Devolver productos al stock
          const venta = ventas.find(v => v.id === ventaId);
          if (venta && venta.estado === 'completada' && venta.productos) {
            const productosActualizados = productos.map(producto => {
              const itemVenta = venta.productos.find(item => item.producto_id === producto.id);
              if (itemVenta) {
                return { ...producto, stock: producto.stock + itemVenta.cantidad };
              }
              return producto;
            });
            setProductos(productosActualizados);
          }
          
          alert('Venta cancelada exitosamente');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(`Error al cancelar la venta: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const calcularTotales = () => {
    const completadas = ventasFiltradas.filter(v => v.estado === 'completada');
    const canceladas = ventasFiltradas.filter(v => v.estado === 'cancelada');
    
    const totalCompletadas = completadas.reduce((total, v) => total + (parseFloat(v.total) || 0), 0);
    const totalCanceladas = canceladas.reduce((total, v) => total + (v.total || 0), 0);

    // Sumar la cantidad de productos vendidos en todas las ventas del día
    const cantidadVendida = ventasFiltradas.reduce((total, v) => {
      if (v.productos && Array.isArray(v.productos)) {
        return total + v.productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
      }
      return total;
    }, 0);

    const ingresosBrutos = totalCompletadas + totalCanceladas;

    return {
      totalCompletadas,
      totalCanceladas,
      cantidadCompletadas: completadas.length,
      cantidadCanceladas: canceladas.length,
      ingresosBrutos,
      ingresosNetos: totalCompletadas,
      cantidadVendida // <-- nuevo campo
    };
  };

  const totales = calcularTotales();

  const setFechaHoy = () => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    console.log(`${dd}-${mm}-${yyyy}`);
    
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const limpiarFiltro = () => {
    setSelectedDate('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Ventas</h2>
          <p className="text-gray-600">Consulta y gestiona el historial de ventas</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Fecha:</label>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={setFechaHoy}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            Hoy
          </button>
          <button
            onClick={limpiarFiltro}
            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
          >
            Todas
          </button>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completadas</h3>
              <p className="text-2xl font-bold text-green-600">{totales.cantidadCompletadas}</p>
              <p className="text-sm text-gray-600">
                ${typeof totales.totalCompletadas === 'number' && !isNaN(totales.totalCompletadas)
                  ? totales.totalCompletadas.toFixed(2)
                  : parseFloat(totales.totalCompletadas) ? parseFloat(totales.totalCompletadas).toFixed(2) : '0.00'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Canceladas</h3>
              <p className="text-2xl font-bold text-red-600">{totales.cantidadCanceladas}</p>
              <p className="text-sm text-gray-600">
                ${typeof totales.totalCanceladas === 'number' && !isNaN(totales.totalCanceladas)
                  ? totales.totalCanceladas.toFixed(2)
                  : parseFloat(totales.totalCanceladas) ? parseFloat(totales.totalCanceladas).toFixed(2) : '0.00'}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Ventas</h3>
              <p className="text-2xl font-bold text-blue-600">{ventasFiltradas.length}</p>
              <p className="text-sm text-gray-600">
                ${typeof totales.ingresosBrutos === 'number' && !isNaN(totales.ingresosBrutos)
                  ? totales.ingresosBrutos.toFixed(2)
                  : parseFloat(totales.ingresosBrutos) ? parseFloat(totales.ingresosBrutos).toFixed(2) : '0.00'}
              </p>
            </div>
            <BarChart className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ingresos Netos</h3>
              <p className="text-2xl font-bold text-purple-600">
                ${typeof totales.ingresosNetos === 'number' && !isNaN(totales.ingresosNetos)
                  ? totales.ingresosNetos.toFixed(2)
                  : parseFloat(totales.ingresosNetos) ? parseFloat(totales.ingresosNetos).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-gray-500">
                Productos vendidos: <span className="font-bold">{totales.cantidadVendida}</span>
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <BarChart className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">
                        {selectedDate 
                          ? 'No hay ventas para la fecha seleccionada' 
                          : 'No hay ventas registradas'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map(venta => (
                  <tr key={venta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{venta.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(venta.fecha).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(venta.fecha).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venta.vendedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        ${typeof venta.total === 'number' && !isNaN(venta.total)
                          ? venta.total.toFixed(2)
                          : parseFloat(venta.total) ? parseFloat(venta.total).toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        venta.estado === 'completada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {venta.estado === 'completada' ? 'Completada' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setMostrarDetalle(venta.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {venta.estado === 'completada' && (
                          <button
                            onClick={() => cancelarVenta(venta.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Cancelar venta"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalle de venta */}
      {mostrarDetalle && (
        <Modal
          title={`Detalle de Venta #${mostrarDetalle}`}
          onClose={() => setMostrarDetalle(null)}
          size="lg"
        >
          {(() => {
            const venta = ventas.find(v => v.id === mostrarDetalle);
            if (!venta) return <p className="text-red-500">Venta no encontrada</p>;
            
            return (
              <div className="space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{new Date(venta.fecha).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vendedor</p>
                    <p className="font-medium">{venta.vendedor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      venta.estado === 'completada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {venta.estado === 'completada' ? 'Completada' : 'Cancelada'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID de Venta</p>
                    <p className="font-medium">#{venta.id}</p>
                  </div>
                </div>
                
                {/* Productos */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Productos vendidos</h4>
                  {venta.productos && venta.productos.length > 0 ? (
                    <div className="space-y-2">
                      {venta.productos.map((producto, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{producto.nombre}</p>
                            <p className="text-sm text-gray-500">
                              Cantidad: {producto.cantidad} × ${
                                typeof producto.precio === 'number' && !isNaN(producto.precio)
                                  ? producto.precio.toFixed(2)
                                  : parseFloat(producto.precio) ? parseFloat(producto.precio).toFixed(2) : '0.00'
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              ${
                                typeof producto.precio === 'number' && !isNaN(producto.precio)
                                  ? (producto.precio * producto.cantidad).toFixed(2)
                                  : (parseFloat(producto.precio) * producto.cantidad)
                                    ? (parseFloat(producto.precio) * producto.cantidad).toFixed(2)
                                    : '0.00'
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay información de productos disponible</p>
                  )}
                </div>
                
                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total de la venta:</span>
                    <span className="text-green-600">
                      ${typeof venta.total === 'number' && !isNaN(venta.total)
                        ? venta.total.toFixed(2)
                        : parseFloat(venta.total) ? parseFloat(venta.total).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

export default HistorialVentasView;