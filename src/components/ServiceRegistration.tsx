import { useState, useEffect } from 'react';
import { Service, CreateServiceDTO } from '../types/service';
import { serviceService } from '../services/service.service';
import toast from 'react-hot-toast';
import { FaTrash, FaEdit } from 'react-icons/fa';

const ServiceRegistration = () => {
  const [formData, setFormData] = useState<CreateServiceDTO>({
    nombre: '',
    precio: 0,
  });

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [editFormData, setEditFormData] = useState<CreateServiceDTO>({
    nombre: '',
    precio: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await serviceService.getServices();
      setServices(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los servicios';
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
      const newService = await serviceService.createService(formData);
      setServices([...services, newService]);
      setFormData({
        nombre: '',
        precio: 0,
      });
      toast.success('Servicio creado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el servicio';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
  };

  const handleEditClick = (service: Service) => {
    setServiceToEdit(service);
    setEditFormData({
      nombre: service.nombre,
      precio: service.precio,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    try {
      await serviceService.deleteService(serviceToDelete.id);
      setServices(services.filter(s => s.id !== serviceToDelete.id));
      toast.success('Servicio eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el servicio';
      toast.error(errorMessage);
    } finally {
      setServiceToDelete(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceToEdit) return;

    if (!editFormData.nombre.trim()) {
      toast.error('El nombre del servicio es requerido');
      return;
    }

    if (editFormData.precio <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    try {
      const updated = await serviceService.updateService(serviceToEdit.id, editFormData);
      setServices(services.map(s => (s.id === updated.id ? updated : s)));
      toast.success('Servicio actualizado exitosamente');
      setServiceToEdit(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el servicio';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCancel = () => {
    setServiceToDelete(null);
  };

  const handleEditCancel = () => {
    setServiceToEdit(null);
    setEditFormData({
      nombre: '',
      precio: 0
    });
  };

  // Función para formatear número como moneda chilena
  const formatCLP = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Función para parsear valor de input de moneda
  const parseCLPInput = (value: string) => {
    // Remover todo excepto números
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue === '' ? 0 : parseInt(numericValue, 10);
  };

  // Función para formatear input de moneda durante la escritura
  const formatCLPInput = (value: number) => {
    if (value === 0) return '';
    return value.toLocaleString('es-CL');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'precio') {
      const numericValue = parseCLPInput(value);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'precio') {
      const numericValue = parseCLPInput(value);
      setEditFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Services Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Servicios Registrados</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre del Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{service.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{formatCLP(service.precio)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    <button
                      onClick={() => handleDeleteClick(service)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-2"
                      title="Eliminar servicio"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditClick(service)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Editar servicio"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-full">
          <div className="absolute inset-0 w-full bg-black/30 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-md w-full bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete.nombre}"?
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
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {serviceToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-full">
          <div className="absolute inset-0 w-full bg-black/30 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-md w-full bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Editar Servicio
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del Servicio
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
                <label htmlFor="edit-precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Precio (CLP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="text"
                    id="edit-precio"
                    name="precio"
                    value={formatCLPInput(editFormData.precio)}
                    onChange={handleEditChange}
                    className="mt-1 block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    placeholder="0"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Formato: pesos chilenos sin decimales
                </p>
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
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Registro de Servicio</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Servicio
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
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio (CLP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="text"
                  id="precio"
                  name="precio"
                  value={formatCLPInput(formData.precio)}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  placeholder="0"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Formato: pesos chilenos sin decimales
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceRegistration;