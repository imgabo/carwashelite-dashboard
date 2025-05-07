import { useState, useEffect, useRef } from 'react';
import { Sale, CreateSaleDTO } from '../types/sale';
import { Client } from '../types/client';
import { Service } from '../types/service';
import { Branch } from '../types/branch';
import { saleService } from '../services/sale.service';
import { clientService } from '../services/client.service';
import { serviceService } from '../services/service.service';
import { branchService } from '../services/branch.service';
import toast from 'react-hot-toast';

interface CustomService {
  nombre: string;
  precio: number;
  descripcion: string;
}

const SaleRegistration = () => {
  const [formData, setFormData] = useState<CreateSaleDTO>({
    clienteId: 0,
    servicios: [],
    sucursalId: 0,
  });

  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedServices, setSelectedServices] = useState<(Service | CustomService)[]>([]);
  const [customService, setCustomService] = useState<CustomService>({
    nombre: '',
    precio: 0,
    descripcion: '',
  });
  const [showCustomServiceForm, setShowCustomServiceForm] = useState(false);
  const suggestionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetchSales();
    fetchClients();
    fetchServices();
    fetchBranches();
  }, []);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const data = await saleService.getSales();
      setSales(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las ventas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los clientes';
      toast.error(errorMessage);
      setClients([]);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await serviceService.getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los servicios';
      toast.error(errorMessage);
      setServices([]);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchService.getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las sucursales';
      toast.error(errorMessage);
      setBranches([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const servicesToSubmit = selectedServices.map(service => {
        if ('id' in service) {
          return { id: service.id };
        } else {
          return {
            nombre: service.nombre,
            precio: service.precio,
            descripcion: service.descripcion
          };
        }
      });

      const saleData: CreateSaleDTO = {
        ...formData,
        servicios: servicesToSubmit
      };

      const newSale = await saleService.createSale(saleData);
      setSales([...sales, newSale]);
      setFormData({
        clienteId: 0,
        servicios: [],
        sucursalId: 0,
      });
      setSelectedServices([]);
      setSearchTerm('');
      setShowCustomServiceForm(false);
      toast.success('Venta registrada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar la venta';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);

    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    suggestionTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
    }, 3000);
  };

  const handleClientSelect = (client: Client) => {
    setSearchTerm(`${client.name} ${client.apellido}`);
    setFormData(prev => ({
      ...prev,
      clienteId: client.id
    }));
    setShowSuggestions(false);
  };

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => 'id' in s && s.id === service.id);
      if (isSelected) {
        return prev.filter(s => !('id' in s) || s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleCustomServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedServices(prev => [...prev, customService]);
    setCustomService({
      nombre: '',
      precio: 0,
      descripcion: '',
    });
    setShowCustomServiceForm(false);
  };

  const filteredClients = clients.filter(client =>
    `${client.name} ${client.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = selectedServices.reduce((sum, service) => sum + service.precio, 0);

  return (
    <div className="space-y-8">
      {/* Sales Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ventas Registradas</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sucursal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Servicios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {`${sale.cliente.name} ${sale.cliente.apellido}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {sale.sucursal.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                    <ul className="list-disc list-inside">
                      {sale.servicios.map((service) => (
                        <li key={service.id}>{service.nombre}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {new Date(sale.fecha).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Registro de Venta</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="relative">
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cliente
              </label>
              <input
                type="text"
                id="cliente"
                value={searchTerm}
                onChange={handleClientSearch}
                className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder="Buscar cliente..."
                disabled={isLoading}
              />
              {showSuggestions && searchTerm && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                      onClick={() => handleClientSelect(client)}
                    >
                      {`${client.name} ${client.apellido}`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sucursal */}
            <div>
              <label htmlFor="sucursal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sucursal
              </label>
              <select
                id="sucursal"
                value={formData.sucursalId}
                onChange={(e) => setFormData(prev => ({ ...prev, sucursalId: Number(e.target.value) }))}
                className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
                disabled={isLoading}
              >
                <option value="">Seleccione una sucursal</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Servicios
              </label>
              <button
                type="button"
                onClick={() => setShowCustomServiceForm(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                + Agregar servicio personalizado
              </button>
            </div>

            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    checked={selectedServices.some(s => 'id' in s && s.id === service.id)}
                    onChange={() => handleServiceToggle(service)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
                  >
                    {service.nombre} - ${service.precio.toFixed(2)}
                  </label>
                </div>
              ))}
            </div>

            {/* Servicios personalizados seleccionados */}
            {selectedServices.filter(service => !('id' in service)).map((service, index) => (
              <div key={index} className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{service.nombre}</p>
                <p className="text-sm text-gray-900 dark:text-white">${service.precio.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Total: ${total.toFixed(2)}
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading || !formData.clienteId || !formData.sucursalId || selectedServices.length === 0}
            >
              {isLoading ? 'Registrando...' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal para servicio personalizado */}
      {showCustomServiceForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Agregar Servicio Personalizado
            </h3>
            <form onSubmit={handleCustomServiceSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={customService.nombre}
                  onChange={(e) => setCustomService(prev => ({ ...prev, nombre: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Precio
                </label>
                <input
                  type="number"
                  id="precio"
                  value={customService.precio}
                  onChange={(e) => setCustomService(prev => ({ ...prev, precio: Number(e.target.value) }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  value={customService.descripcion}
                  onChange={(e) => setCustomService(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCustomServiceForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleRegistration; 