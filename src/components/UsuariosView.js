import React, { useState } from 'react';
import { Edit, Trash2, Plus, User } from 'lucide-react';
import Modal from './common/Modal';
import { usersAPI } from '../services/api';

const UsuariosView = ({ 
  currentUser,
  users, 
  setUsers, 
  showModal, 
  setShowModal, 
  editingItem, 
  setEditingItem 
}) => {
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    password: '', 
    rol: 'vendedor' 
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingItem) {
        const response = await usersAPI.update(editingItem.id, formData, currentUser.token);
        
        if (response.success) {
          setUsers(users.map(u => u.id === editingItem.id ? response.user : u));
          alert('Usuario actualizado exitosamente');
        }
      } else {
        const response = await usersAPI.create(formData, currentUser.token);
        
        if (response.success) {
          setUsers([...users, response.user]);
          alert('Usuario creado exitosamente');
        }
      }
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al guardar el usuario: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', email: '', password: '', rol: 'vendedor' });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (user) => {
    setEditingItem(user);
    setFormData({ 
      nombre: user.nombre,
      email: user.email,
      password: '', // No pre-llenar la contraseña por seguridad
      rol: user.rol
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const response = await usersAPI.delete(id, currentUser.token);
        
        if (response.success) {
          setUsers(users.filter(u => u.id !== id));
          alert('Usuario eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(`Error al eliminar el usuario: ${error.message}`);
      }
    }
  };

  const openNewUserModal = () => {
    setEditingItem(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'vendedor' });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
          <p className="text-gray-600">Gestiona los usuarios del sistema</p>
        </div>
        <button
          onClick={openNewUserModal}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <User className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No hay usuarios registrados</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                        {user.id === currentUser.id && (
                          <div className="text-xs text-blue-600">Tu cuenta</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      user.rol === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.rol === 'admin' ? 'Administrador' : 'Vendedor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {showModal && (
        <Modal
          title={editingItem ? 'Editar Usuario' : 'Nuevo Usuario'}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo:
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={formLoading}
                placeholder="Ingresa el nombre completo"
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
                placeholder="usuario@ejemplo.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña:
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={!editingItem}
                disabled={formLoading}
                placeholder={editingItem ? "Dejar vacío para mantener contraseña actual" : "Mínimo 6 caracteres"}
                minLength={editingItem ? 0 : 6}
              />
              {editingItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Deja este campo vacío si no deseas cambiar la contraseña
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol:
              </label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={formLoading}
              >
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
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

export default UsuariosView;