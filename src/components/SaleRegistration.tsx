import { useState, useEffect, useRef } from 'react';
import { Sale } from '../types/sale';
import { Client } from '../types/client';
import { Service } from '../types/service';
import { Branch } from '../types/branch';
import { saleService } from '../services/sale.service';
import { clientService } from '../services/client.service';
import { serviceService } from '../services/service.service';
import { branchService } from '../services/branch.service';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

interface CustomService {
  nombre: string;
  precio: number;
  descripcion: string;
}

const SaleRegistration = () => {
  const [formData, setFormData] = useState({
    clienteId: 0,
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
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pagado, setPagado] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSale, setDetailSale] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isTogglingPaid, setIsTogglingPaid] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportRange, setExportRange] = useState<'1m' | '3m' | '6m' | 'custom'>('1m');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
      const serviciosIds = selectedServices
        .filter((service): service is Service => 'id' in service)
        .map(service => service.id);

      const serviciosPersonalizados = selectedServices
        .filter(service => !('id' in service));

      const saleData = {
        clienteId: formData.clienteId,
        sucursalId: formData.sucursalId,
        serviciosIds,
        serviciosPersonalizados,
        pagado,
      };

      const newSale = await saleService.createSale(saleData);
      setSales([...sales, newSale]);
      setFormData({
        clienteId: 0,
        sucursalId: 0,
      });
      setSelectedServices([]);
      setSearchTerm('');
      setShowCustomServiceForm(false);
      setPagado(true);
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

  const handleShowDetail = async (saleId: number) => {
    setIsDetailLoading(true);
    setDetailError(null);
    setShowDetailModal(true);
    try {
      const { data } = await axios.get(`http://localhost:3000/api/venta/${saleId}`);
      setDetailSale(data);
    } catch (err: any) {
      setDetailError('Error al cargar el detalle de la venta');
      setDetailSale(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setDetailSale(null);
    setDetailError(null);
  };

  const handleTogglePagado = async () => {
    if (!detailSale) return;
    setIsTogglingPaid(true);
    try {
      const { data } = await axios.patch(`http://localhost:3000/api/venta/${detailSale.id}`, { pagado: !detailSale.pagado });
      setDetailSale((prev: any) => ({ ...prev, pagado: data.pagado }));
      toast.success('Estado de pago actualizado');
      fetchSales();
    } catch (err) {
      toast.error('Error al actualizar el estado de pago');
    } finally {
      setIsTogglingPaid(false);
    }
  };

  const handleDeleteClick = (sale: Sale) => {
    setSaleToDelete(sale);
  };

  const handleDeleteConfirm = async () => {
    if (!saleToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/api/venta/${saleToDelete.id}`);
      toast.success('Venta eliminada');
      fetchSales();
    } catch (err) {
      toast.error('Error al eliminar la venta');
    } finally {
      setIsDeleting(false);
      setSaleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setSaleToDelete(null);
  };

  // Filtro de ventas para la tabla
  const filteredSales = sales.filter((sale) => {
    const search = tableSearch.toLowerCase();
    const cliente = `${sale.cliente?.name ?? ''} ${sale.cliente?.apellido ?? ''}`.toLowerCase();
    const sucursal = sale.sucursal?.nombre?.toLowerCase() ?? '';
    const servicios = sale.servicios?.map(s => s.nombre).join(' ').toLowerCase() ?? '';
    const total = Number(sale.total).toLocaleString('es-CL');
    const pagado = sale.pagado ? 'pagado' : 'no pagado';
    const fecha = (() => {
      const dateStr = sale.createdAt || sale.fecha;
      const date = dateStr ? new Date(dateStr) : null;
      return date && !isNaN(date.getTime())
        ? date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
        : '-';
    })().toLowerCase();
    return (
      cliente.includes(search) ||
      sucursal.includes(search) ||
      servicios.includes(search) ||
      total.includes(search) ||
      pagado.includes(search) ||
      fecha.includes(search)
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const paginatedSales = filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    // Si el filtro cambia y la página actual queda fuera de rango, vuelve a la primera página
    if (currentPage > totalPages) setCurrentPage(1);
    // eslint-disable-next-line
  }, [filteredSales.length]);

  // Calcula fechas según rango
  const getExportDates = () => {
    const today = new Date();
    let fechaFin = today;
    let fechaInicio = new Date();
    if (exportRange === '1m') {
      fechaInicio.setMonth(today.getMonth() - 1);
    } else if (exportRange === '3m') {
      fechaInicio.setMonth(today.getMonth() - 3);
    } else if (exportRange === '6m') {
      fechaInicio.setMonth(today.getMonth() - 6);
    } else if (exportRange === 'custom') {
      return {
        fechaInicio: customStart,
        fechaFin: customEnd ? `${customEnd}T23:59:59` : '',
      };
    }
    return {
      fechaInicio: fechaInicio.toISOString().slice(0, 10),
      fechaFin: today.toISOString().slice(0, 10) + 'T23:59:59',
    };
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { fechaInicio, fechaFin } = getExportDates();
      const base64 = await saleService.exportExcel(fechaInicio, fechaFin);
      // Decodificar base64 a Blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const todayStr = new Date().toISOString().slice(0, 10);
      link.download = `ventas-${todayStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportMenu(false);
    } catch (err) {
      toast.error('Error al exportar Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Sales Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex  justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ventas Registradas</h2>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="px-4 py-2 text-sm font-medium rounded bg-green-600 hover:bg-green-700 text-white shadow"
            >
              Exportar Excel
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20 p-4">
                <div className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Rango a exportar:</div>
                <div className="space-y-2 text-white">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="exportRange" checked={exportRange === '1m'} onChange={() => setExportRange('1m')} />
                    Último mes
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="exportRange" checked={exportRange === '3m'} onChange={() => setExportRange('3m')} />
                    Últimos 3 meses
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="exportRange" checked={exportRange === '6m'} onChange={() => setExportRange('6m')} />
                    Últimos 6 meses
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="exportRange" checked={exportRange === 'custom'} onChange={() => setExportRange('custom')} />
                    Personalizado
                  </label>
                  {exportRange === 'custom' && (
                    <div className="flex flex-col gap-2 pl-6">
                      <input
                        type="date"
                        value={customStart}
                        onChange={e => setCustomStart(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowExportMenu(false)}
                    className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={isExporting || (exportRange === 'custom' && (!customStart || !customEnd))}
                    className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {isExporting ? 'Exportando...' : 'Exportar'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            value={tableSearch}
            onChange={e => setTableSearch(e.target.value)}
            placeholder="Buscar en ventas..."
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {/* Filtro de búsqueda */}
  
        <div className={`overflow-x-auto ${filteredSales.length > 4 ? 'max-h-[320px]' : ''} min-h-[320px]`}
             style={filteredSales.length > 4 ? {overflowY: 'auto'} : {}}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sucursal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Servicios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pagado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400 text-lg">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out animate-fadeIn">
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
                      ${Number(sale.total).toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {sale.pagado ? (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-400">Pagado</span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-400">No pagado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {(() => {
                        const dateStr = sale.createdAt || sale.fecha;
                        const date = dateStr ? new Date(dateStr) : null;
                        return date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '-';
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowDetail(sale.id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 underline"
                          title="Ver detalle"
                        >
                          Ver detalle
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sale)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition"
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <FaTrash className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-gray-700 dark:text-gray-200">Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
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
                    {service.nombre} - ${Number(service.precio).toLocaleString('es-CL')}
                  </label>
                </div>
              ))}
            </div>

            {/* Servicios personalizados seleccionados */}
            {selectedServices.filter(service => !('id' in service)).map((service, index) => (
              <div key={index} className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{service.nombre}</p>
                <p className="text-sm text-gray-900 dark:text-white">${Number(service.precio).toLocaleString('es-CL')}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Total: ${Number(total).toLocaleString('es-CL')}
            </p>
          </div>

          {/* Checkbox Pagado */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pagado"
              checked={pagado}
              onChange={() => setPagado(prev => !prev)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="pagado" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
              Pagado
            </label>
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

      {/* Modal de detalle de venta */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full relative">
            <button
              onClick={handleCloseDetail}
              className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-800 dark:hover:text-white cursor-pointer font-bold"
              title="Cerrar"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-200">Detalle de Venta</h3>
            {isDetailLoading ? (
              <div className="text-center text-gray-700 dark:text-gray-200">Cargando...</div>
            ) : detailError ? (
              <div className="text-center text-red-600">{detailError}</div>
            ) : detailSale && (
              <div className="space-y-6">
                <div>
                  <span className="font-semibold text-lg block mb-1 text-gray-300">Cliente</span>
                  <span className="text-gray-100">{detailSale.cliente?.name} {detailSale.cliente?.apellido}</span>
                  <span className="text-gray-400 ml-2">({detailSale.cliente?.telefono})</span>
                </div>
                <div>
                  <span className="font-semibold text-lg block mb-1 text-gray-300">Sucursal</span>
                  <span className="text-gray-100">{detailSale.sucursal?.nombre}</span>
                  <span className="text-gray-400 ml-2">({detailSale.sucursal?.direccion})</span>
                </div>
                <hr className="border-gray-600" />
                <div>
                  <span className="font-semibold text-lg block mb-2 text-gray-300">Servicios</span>
                  <ul className="ml-4 space-y-1">
                    {detailSale.servicios?.map((s: any, idx: number) => (
                      <li key={idx} className="flex justify-between">
                        <span className="text-gray-100">{s.nombre}</span>
                        <span className="font-mono text-right text-gray-100">${Number(s.precio).toLocaleString('es-CL')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {detailSale.serviciosPersonalizados?.length > 0 && (
                  <>
                    <hr className="border-gray-600" />
                    <div>
                      <span className="font-semibold text-lg block mb-2 text-gray-300">Servicios Personalizados</span>
                      <ul className="ml-4 space-y-2">
                        {detailSale.serviciosPersonalizados.map((sp: any, idx: number) => (
                          <li key={idx} className="pl-3 border-l-4 border-indigo-400">
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-100">{sp.nombre}</span>
                              <span className="font-mono text-gray-100">${Number(sp.precio).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{sp.descripcion}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                <hr className="border-gray-600" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-300">Total:</span>
                  <span className="font-mono text-lg text-gray-100">${Number(detailSale.total).toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-300">Pagado:</span>
                  {detailSale.pagado ? (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">Pagado</span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">No pagado</span>
                  )}
                  <button
                    onClick={handleTogglePagado}
                    disabled={isTogglingPaid}
                    className={`ml-4 px-3 py-1 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50`}
                  >
                    {detailSale.pagado ? 'Marcar como No Pagado' : 'Marcar como Pagado'}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-300">Fecha:</span>
                  <span className="text-gray-100">
                    {(() => {
                      const dateStr = detailSale.createdAt || detailSale.fecha;
                      const date = dateStr ? new Date(dateStr) : null;
                      return date && !isNaN(date.getTime())
                        ? date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
                        : '-';
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-full">
          <div className="absolute inset-0 w-full bg-black/30 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-md w-full bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar la venta de <b>{saleToDelete.cliente?.name} {saleToDelete.cliente?.apellido}</b>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animación fadeIn para las filas de la tabla */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in;
          }
        `}
      </style>
    </div>
  );
};

export default SaleRegistration;