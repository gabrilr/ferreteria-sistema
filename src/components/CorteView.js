import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { corteCajaAPI } from '../services/api';

const CorteView = ({ 
  currentUser,
  ventas, 
  loading, 
  setLoading 
}) => {
  const [resumenDia, setResumenDia] = useState(null);
  const [corteRealizado, setCorteRealizado] = useState(false);

  useEffect(() => {
    cargarResumenDelDia();
  }, [ventas]);

  const cargarResumenDelDia = async () => {
    try {
      const response = await corteCajaAPI.getResumenToday(currentUser.token);
      if (response.success) {
        setResumenDia(response.resumen);
        setCorteRealizado(response.resumen.corteYaRealizado);
      }
    } catch (error) {
      console.error('Error al cargar resumen:', error);
    }
  };

  const ventasHoy = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha).toDateString();
    const fechaHoy = new Date().toDateString();
    return fechaVenta === fechaHoy;
  });

  const ventasCompletadas = ventasHoy.filter(v => v.estado === 'completada');
  const ventasCanceladas = ventasHoy.filter(v => v.estado === 'cancelada');
  
  const totalVentasCompletadas = ventasCompletadas.reduce(
    (total, v) => total + (parseFloat(v.total) || 0), 0
  );
  
  const totalVentasCanceladas = ventasCanceladas.reduce(
    (total, v) => total + (parseFloat(v.total) || 0), 0
  );
  
  // Calcular productos vendidos
  const totalProductosVendidos = ventasCompletadas.reduce((total, v) => 
    total + (v.productos?.reduce((subtotal, p) => subtotal + (p.cantidad || 0), 0) || 0), 0
  );

  const formatCurrency = (value) =>
    typeof value === 'number' && !isNaN(value)
      ? value.toFixed(2)
      : parseFloat(value) ? parseFloat(value).toFixed(2) : '0.00';

  const cerrarCaja = async () => {
    if (corteRealizado) {
      alert('La caja ya ha sido cerrada para el día de hoy');
      return;
    }

    if (ventasHoy.length === 0) {
      const continuar = window.confirm(
        'No hay ventas registradas para hoy. ¿Estás seguro de que deseas cerrar la caja?'
      );
      if (!continuar) return;
    }

    const confirmacion = window.confirm(
      `¿Estás seguro de cerrar la caja?\n\n` +
      `Ventas completadas: ${ventasCompletadas.length}\n` +
      `Total ingresos: $${formatCurrency(totalVentasCompletadas)}\n\n` +
      `Esta acción generará un cierre de caja y no se podrá abrir hasta el siguiente día.`
    );

    if (confirmacion) {
      setLoading(true);
      try {
        const cierreData = {
          responsable: currentUser.nombre,
          ventasCompletadas: ventasCompletadas.length,
          ventasCanceladas: ventasCanceladas.length,
          totalIngresos: totalVentasCompletadas,
          productosVendidos: totalProductosVendidos
        };

        const response = await corteCajaAPI.create(cierreData, currentUser.token);

        if (response.success) {
          setCorteRealizado(true);
          alert(
            '✅ Caja cerrada exitosamente\n\n' +
            `Fecha: ${new Date().toLocaleDateString()}\n` +
            `Hora: ${new Date().toLocaleTimeString()}\n` +
            `Responsable: ${currentUser.nombre}\n` +
            `Total de ventas: ${ventasCompletadas.length}\n` +
            `Ingresos totales: $${formatCurrency(totalVentasCompletadas)}\n\n` +
            'El reporte de cierre ha sido guardado exitosamente.'
          );
          
          // Recargar resumen
          await cargarResumenDelDia();
        }
      } catch (error) {
        console.error('Error:', error);
        alert(`Error al cerrar la caja: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !resumenDia) {
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Corte de Caja</h2>
          <p className="text-gray-600">Resumen y cierre del día</p>
        </div>
        <button
          onClick={cerrarCaja}
          disabled={loading || corteRealizado}
          className={`px-6 py-2 rounded-md font-semibold flex items-center space-x-2 transition duration-200 ${
            corteRealizado 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{loading ? 'Cerrando...' : corteRealizado ? 'Caja Cerrada' : 'Cerrar Caja'}</span>
        </button>
      </div>

      {corteRealizado && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">
                ✅ <strong>Caja cerrada</strong> - El corte de caja para el día de hoy ya ha sido realizado.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ventas Completadas</h3>
              <p className="text-2xl font-bold text-green-600">{ventasCompletadas.length}</p>
              <p className="text-sm text-gray-600 mt-1">
                ${typeof totalVentasCompletadas === 'number' && !isNaN(totalVentasCompletadas)
                  ? totalVentasCompletadas.toFixed(2)
                  : parseFloat(totalVentasCompletadas) ? parseFloat(totalVentasCompletadas).toFixed(2) : '0.00'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ventas Canceladas</h3>
              <p className="text-2xl font-bold text-red-600">{ventasCanceladas.length}</p>
              <p className="text-sm text-gray-600 mt-1">
                ${typeof totalVentasCanceladas === 'number' && !isNaN(totalVentasCanceladas)
                  ? totalVentasCanceladas.toFixed(2)
                  : parseFloat(totalVentasCanceladas) ? parseFloat(totalVentasCanceladas).toFixed(2) : '0.00'}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Productos Vendidos</h3>
              <p className="text-2xl font-bold text-purple-600">{totalProductosVendidos}</p>
              <p className="text-sm text-gray-600 mt-1">unidades</p>
            </div>
            <Package className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ingresos Netos</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${typeof totalVentasCompletadas === 'number' && !isNaN(totalVentasCompletadas)
                  ? totalVentasCompletadas.toFixed(2)
                  : parseFloat(totalVentasCompletadas) ? parseFloat(totalVentasCompletadas).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-600 mt-1">del día</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Resumen adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calculator className="w-5 h-5 text-blue-500 mr-2" />
            Resumen del Día
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de transacciones:</span>
              <span className="font-semibold">{ventasHoy.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Promedio por venta:</span>
              <span className="font-semibold">
                ${ventasCompletadas.length > 0 ? (totalVentasCompletadas / ventasCompletadas.length).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tasa de éxito:</span>
              <span className="font-semibold">
                {ventasHoy.length > 0 ? ((ventasCompletadas.length / ventasHoy.length) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold text-gray-800">Ingresos totales:</span>
              <span className="font-bold text-green-600">
                ${typeof totalVentasCompletadas === 'number' && !isNaN(totalVentasCompletadas)
                  ? totalVentasCompletadas.toFixed(2)
                  : parseFloat(totalVentasCompletadas) ? parseFloat(totalVentasCompletadas).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">⏰ Información del Corte</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-semibold">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora actual:</span>
              <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Responsable:</span>
              <span className="font-semibold">{currentUser?.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado de caja:</span>
              <span className={`font-semibold ${corteRealizado ? 'text-red-600' : 'text-green-600'}`}>
                {corteRealizado ? 'Cerrada' : 'Abierta'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              💡 <strong>Nota:</strong> El cierre de caja generará un reporte completo y registrará las operaciones del día.
            </p>
          </div>
        </div>
      </div>

      {/* Detalle de ventas del día */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">📋 Detalle de Ventas del Día</h3>
        
        {ventasHoy.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay ventas registradas hoy</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ventasHoy.map(venta => (
                  <tr key={venta.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(venta.fecha).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{venta.vendedor}</td>
                    <td className="px-4 py-4 text-sm">
                      <div className="max-w-xs">
                        {venta.productos?.map((p, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {p.nombre} (x{p.cantidad})
                          </div>
                        )) || <span className="text-gray-400">Sin detalles</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold">
                      <span className={venta.estado === 'completada' ? 'text-green-600' : 'text-red-600'}>
                        ${typeof venta.total === 'number' && !isNaN(venta.total)
                          ? venta.total.toFixed(2)
                          : parseFloat(venta.total) ? parseFloat(venta.total).toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        venta.estado === 'completada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {venta.estado === 'completada' ? 'Completada' : 'Cancelada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorteView;