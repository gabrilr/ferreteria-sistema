import React, { useState } from 'react';
import { Edit, Trash2, Plus, Building2, Phone, Mail } from 'lucide-react';
import Modal from './common/Modal';
import { proveedoresAPI } from '../services/api';

const ProveedoresView = ({ 
  currentUser,
  proveedores, 
  setProveedores, 
  showModal, 
  setShowModal, 
  editingItem, 
  setEditingItem 
}) => {
  const [formData, setFormData] = useState({ 
    nombre: '', 
    contacto: '', 
    telefono: '', 
    email: '' 
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingItem) {
        const response = await proveedoresAPI.update(editingItem.id, formData, currentUser.token);
        
        if (response.success) {
          setProveedores(proveedores.map(p => p.id === editingItem.id ? response.proveedor : p));
          alert('Proveedor actualizado exitosamente');
        }
      } else {
        const response = await proveedoresAPI.create(formData, currentUser.token);
        
        if (response.success) {
          setProveedores([...proveedores, response.proveedor]);
          alert('Proveedor creado exitosamente');
        }
      }
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al guardar el proveedor: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', contacto: '', telefono: '', email: '' });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (proveedor) => {
    setEditingItem(proveedor);
    setFormData({ 
      nombre: proveedor.nombre,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      try {
        const response = await proveedoresAPI.delete(id, currentUser.token);
        
        if (response.success) {
          setProveedores(proveedores.filter(p => p.id !== id));
          alert('Proveedor eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(`Error al eliminar el proveedor: ${error.message}`);
      }
    }
  };

  const openNewProveedorModal = () => {
    setEditingItem(null);
    setFormData({ nombre: '', contacto: '', telefono: '', email: '' });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proveedores</h2>
          <p className="text-gray-600">Gestiona la información de proveedores</p>
        </div>
        <button
          onClick={openNewProveedorModal}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Información
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No hay proveedores registrados</p>
                  </div>
                </td>
              </tr>
            ) : (
              proveedores.map(proveedor => (
                <tr key={proveedor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{proveedor.nombre}</div>
                        <div className="text-xs text-gray-500">ID: {proveedor.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{proveedor.contacto}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {proveedor.telefono}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {proveedor.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(proveedor)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Editar proveedor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(proveedor.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Eliminar proveedor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editingItem ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la empresa:
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={formLoading}
                placeholder="Ej: Ferretería Central S.A."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persona de contacto:
              </label>
              <input
                type="text"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={formLoading}
                placeholder="Ej: Carlos López"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono:
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={formLoading}
                placeholder="Ej: +52 555-123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email:
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={formLoading}
                placeholder="contacto@empresa.com"
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

export default ProveedoresView;