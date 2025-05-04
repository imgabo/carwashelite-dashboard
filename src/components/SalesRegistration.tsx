import { useState } from 'react';

interface SaleFormData {
  clientId: string;
  branchId: string;
  serviceId: string;
  extraCost: number;
  extraCostDescription: string;
  isCompany: boolean;
}

// Mock data - In a real application, this would come from your API
const mockClients = [
  { id: '1', name: 'Cliente 1' },
  { id: '2', name: 'Cliente 2' },
];

const mockBranches = [
  { id: '1', name: 'Sucursal Centro' },
  { id: '2', name: 'Sucursal Norte' },
];

const mockServices = [
  { id: '1', name: 'Lavado Básico', price: 100 },
  { id: '2', name: 'Lavado Premium', price: 200 },
  { id: '3', name: 'Lavado Completo', price: 300 },
];

const SalesRegistration = () => {
  const [formData, setFormData] = useState<SaleFormData>({
    clientId: '',
    branchId: '',
    serviceId: '',
    extraCost: 0,
    extraCostDescription: '',
    isCompany: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className=" bg-white dark:bg-gray-800 shadow rounded-lg p-6 mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Registro de Venta</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cliente
          </label>
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            required
          >
            <option value="">Seleccione un cliente</option>
            {mockClients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Selection */}
        <div>
          <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sucursal
          </label>
          <select
            id="branchId"
            name="branchId"
            value={formData.branchId}
            onChange={handleChange}
            className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            required
          >
            <option value="">Seleccione una sucursal</option>
            {mockBranches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Service Selection */}
        <div>
          <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Servicio
          </label>
          <select
            id="serviceId"
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            required
          >
            <option value="">Seleccione un servicio</option>
            {mockServices.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price}
              </option>
            ))}
          </select>
        </div>

        {/* Extra Cost */}
        <div>
          <label htmlFor="extraCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Costo Extra
          </label>
          <input
            type="number"
            id="extraCost"
            name="extraCost"
            value={formData.extraCost}
            onChange={handleChange}
            className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            min="0"
            step="0.01"
          />
        </div>

        {/* Extra Cost Description */}
        <div>
          <label htmlFor="extraCostDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descripción del Costo Extra
          </label>
          <input
            type="text"
            id="extraCostDescription"
            name="extraCostDescription"
            value={formData.extraCostDescription}
            onChange={handleChange}
            className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>

        {/* Company Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isCompany"
            name="isCompany"
            checked={formData.isCompany}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isCompany" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Es una empresa
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Registrar Venta
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesRegistration; 