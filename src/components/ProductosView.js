import React, { useState } from 'react';
import { Edit, Trash2, Plus, Package, AlertTriangle, Lock } from 'lucide-react';
import Modal from './common/Modal';
import { productosAPI } from '../services/api';

const ProductosView = ({ 
  currentUser,
  productos, 
  setProductos, 
  categorias,
  proveedores,
  showModal, 
  setShowModal, 
  editingItem, 
  setEditingItem 
}) => {
  const [formData, setFormData] = useState({ 
    nombre: '', 
    codigo: '', 
    precio: '', 
    stock: '', 
    stockMinimo: '', 
    categoria_id: '', 
    proveedor_id: '' 
  });
  const [formLoading, setFormLoading] = useState(false);

  // Verificar si el usuario es admin
  const isAdmin = currentUser?.rol === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    setFormLoading(true);

    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        stockMinimo: parseInt(formData.stockMinimo),
        categoria_id: parseInt(formData.categoria_id),
        proveedor_id: parseInt(formData.proveedor_id)
      };

      if (editingItem) {
        const response = await productosAPI.update(editingItem.id, productData, currentUser.token);
        
        if (response.success) {
          setProductos(productos.map(p => p.id === editingItem.id ? response.producto : p));
          alert('Producto actualizado exitosamente');
        }
      } else {
        const response = await productosAPI.create(productData, currentUser.token);
        
        if (response.success) {
          setProductos([...productos, response.producto]);
          alert('Producto creado exitosamente');
        }
      }
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al guardar el producto: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', codigo: '', precio: '', stock: '', stockMinimo: '', categoria_id: '', proveedor_id: '' });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (product) => {
    if (!isAdmin) {
      alert('No tienes permisos para editar productos');
      return;
    }
    
    setEditingItem(product);
    setFormData({ 
      nombre: product.nombre,
      codigo: product.codigo,
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      stockMinimo: product.stockMinimo.toString(),
      categoria_id: product.categoria_id.toString(),
      proveedor_id: product.proveedor_id.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert('No tienes permisos para eliminar productos');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const response = await productosAPI.delete(id, currentUser.token);
        
        if (response.success) {
          setProductos(productos.filter(p => p.id !== id));
          alert('Producto eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(`Error al eliminar el producto: ${error.message}`);
      }
    }
  };

  const openNewProductModal = () => {
    if (!isAdmin) {
      alert('No tienes permisos para crear productos');
      return;
    }
    
    setEditingItem(null);
    setFormData({ nombre: '', codigo: '', precio: '', stock: '', stockMinimo: '', categoria_id: '', proveedor_id: '' });
    setShowModal(true);
  };

  const getCategoriaName = (id) => categorias.find(c => c.id === id)?.nombre || 'Sin categoría';
  const getProveedorName = (id) => proveedores.find(p => p.id === id)?.nombre || 'Sin proveedor';

  const getStockStatus = (producto) => {
    if (producto.stock <= 0) return { color: 'bg-red-100 text-red-800', text: 'Sin stock' };
    if (producto.stock <= producto.stockMinimo) return { color: 'bg-yellow-100 text-yellow-800', text: 'Stock bajo' };
    return { color: 'bg-green-100 text-green-800', text: 'Stock normal' };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
          <p className="text-gray-600">
            {isAdmin ? 'Gestiona el inventario de productos' : 'Consulta el inventario de productos'}
          </p>
          {!isAdmin && (
            <div className="mt-2 flex items-center text-amber-600">
              <Lock className="w-4 h-4 mr-1" />
              <span className="text-sm">Vista de solo lectura - Permisos de vendedor</span>
            </div>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={openNewProductModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2 transition duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? "6" : "5"} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No hay productos registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                productos.map(producto => {
                  const stockStatus = getStockStatus(producto);
                  return (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                            <div className="text-xs text-gray-500">{getProveedorName(producto.proveedor_id)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {producto.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${typeof producto.precio === 'number' && !isNaN(producto.precio)
                          ? producto.precio.toFixed(2)
                          : parseFloat(producto.precio) ? parseFloat(producto.precio).toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${stockStatus.color}`}>
                            {producto.stock}
                          </span>
                          {producto.stock <= producto.stockMinimo && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" title="Stock bajo" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Mín: {producto.stockMinimo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCategoriaName(producto.categoria_id)}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(producto)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Editar producto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(producto.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && isAdmin && (
        <Modal
          title={editingItem ? 'Editar Producto' : 'Nuevo Producto'}
          onClose={resetForm}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del producto:
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                  placeholder="Ej: Martillo 16oz"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código:
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                  placeholder="Ej: MAR001"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio:
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock actual:
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock mínimo:
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría:
                </label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor:
                </label>
                <select
                  value={formData.proveedor_id}
                  onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={formLoading}
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(prov => (
                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition duration-200"
                disabled={formLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition duration-200"
                disabled={formLoading}
              >
                {formLoading ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProductosView;