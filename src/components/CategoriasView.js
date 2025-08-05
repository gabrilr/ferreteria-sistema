import React, { useState } from 'react';
import { Edit, Trash2, Plus, Tag, Package } from 'lucide-react';
import Modal from './common/Modal';
import { categoriasAPI } from '../services/api';

const CategoriasView = ({ 
  currentUser,
  categorias, 
  setCategorias, 
  productos,
  showModal, 
  setShowModal, 
  editingItem, 
  setEditingItem 
}) => {
  const [formData, setFormData] = useState({ 
    nombre: '', 
    descripcion: '' 
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingItem) {
        const response = await categoriasAPI.update(editingItem.id, formData, currentUser.token);
        
        if (response.success) {
          setCategorias(categorias.map(c => c.id === editingItem.id ? response.categoria : c));
          alert('Categoría actualizada exitosamente');
        }
      } else {
        const response = await categoriasAPI.create(formData, currentUser.token);
        
        if (response.success) {
          setCategorias([...categorias, response.categoria]);
          alert('Categoría creada exitosamente');
        }
      }
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al guardar la categoría: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (categoria) => {
    setEditingItem(categoria);
    setFormData({ 
      nombre: categoria.nombre,
      descripcion: categoria.descripcion
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Verificar si hay productos asociados a esta categoría
    const productosAsociados = productos.filter(p => p.categoria_id === id).length;
    
    if (productosAsociados > 0) {
      alert(`No se puede eliminar la categoría porque tiene ${productosAsociados} producto(s) asociado(s).`);
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        const response = await categoriasAPI.delete(id, currentUser.token);
        
        if (response.success) {
          setCategorias(categorias.filter(c => c.id !== id));
          alert('Categoría eliminada exitosamente');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(`Error al eliminar la categoría: ${error.message}`);
      }
    }
  };

  const openNewCategoriaModal = () => {
    setEditingItem(null);
    setFormData({ nombre: '', descripcion: '' });
    setShowModal(true);
  };

  const getProductCount = (categoriaId) => {
    return productos.filter(p => p.categoria_id === categoriaId).length;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
          <p className="text-gray-600">Organiza los productos por categorías</p>
        </div>
        <button
          onClick={openNewCategoriaModal}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Tag className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No hay categorías registradas</p>
                  </div>
                </td>
              </tr>
            ) : (
              categorias.map(categoria => {
                const productCount = getProductCount(categoria.id);
                return (
                  <tr key={categoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <Tag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{categoria.nombre}</div>
                          <div className="text-xs text-gray-500">ID: {categoria.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {categoria.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          productCount > 0 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {productCount} productos
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(categoria)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Editar categoría"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(categoria.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Eliminar categoría"
                          disabled={productCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {productCount > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          No se puede eliminar
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editingItem ? 'Editar Categoría' : 'Nueva Categoría'}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la categoría:
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={formLoading}
                placeholder="Ej: Herramientas"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción:
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                required
                disabled={formLoading}
                placeholder="Describe qué tipo de productos incluye esta categoría..."
              />
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

export default CategoriasView;