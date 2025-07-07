import { useState, useEffect } from 'react';
import { Branch, CreateBranchDTO } from '../types/branch';
import { branchService } from '../services/branch.service';
import toast, { Toaster } from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BranchRegistration = () => {
  const [formData, setFormData] = useState<CreateBranchDTO>({
    nombre: '',
    direccion: '',
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [editFormData, setEditFormData] = useState<CreateBranchDTO>({
    nombre: '',
    direccion: '',
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las sucursales';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newBranch = await branchService.createBranch(formData);
      setBranches([...branches, newBranch]);
      setFormData({
        nombre: '',
        direccion: '',
      });
      toast.success('Sucursal creada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar la sucursal';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (branch: Branch) => {
    setBranchToEdit(branch);
    setEditFormData({
      nombre: branch.nombre,
      direccion: branch.direccion,
    });
  };

  const handleDeleteClick = (branch: Branch) => {
    setBranchToDelete(branch);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchToEdit) return;

    try {
      setIsLoading(true);
      const updatedBranch = await branchService.updateBranch(branchToEdit.id, editFormData);
      setBranches(branches.map(branch => 
        branch.id === branchToEdit.id ? updatedBranch : branch
      ));
      toast.success('Sucursal actualizada exitosamente');
      setBranchToEdit(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la sucursal';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;

    try {
      setIsLoading(true);
      await branchService.deleteBranch(branchToDelete.id);
      setBranches(branches.filter(branch => branch.id !== branchToDelete.id));
      toast.success('Sucursal eliminada exitosamente');
      setBranchToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la sucursal';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCancel = () => {
    setBranchToEdit(null);
    setEditFormData({
      nombre: '',
      direccion: '',
    });
  };

  const handleDeleteCancel = () => {
    setBranchToDelete(null);
  };

  return (
    <div className="space-y-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              border: '1px solid #4aed88',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              border: '1px solid #ff4b4b',
            },
          },
        }}
      />
      {/* Branches Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Sucursales Registradas</h2>
        </div>
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="overflow-x-auto max-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre de la Sucursal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{branch.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{branch.direccion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(branch)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="Editar"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(branch)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Eliminar"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Registro de Sucursal
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de la Sucursal
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrar Sucursal'}
            </button>
          </div>
        </form>
      </div>

      {/* Edit Modal */}
      {branchToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-full">
          <div className="absolute inset-0 w-full bg-black/30 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-md w-full bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Editar Sucursal
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre de la Sucursal
                </label>
                <input
                  type="text"
                  id="edit-nombre"
                  name="nombre"
                  value={editFormData.nombre}
                  onChange={handleEditChange}
                  className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <input
                  type="text"
                  id="edit-direccion"
                  name="direccion"
                  value={editFormData.direccion}
                  onChange={handleEditChange}
                  className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-full">
          <div className="absolute inset-0 w-full bg-black/30 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-md w-full bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar la sucursal "{branchToDelete.nombre}"?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchRegistration;