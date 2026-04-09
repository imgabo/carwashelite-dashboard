import { useState, useEffect, useRef, useMemo } from 'react';
import { Sale } from '../types/sale';
import { Client } from '../types/client';
import { Service } from '../types/service';
import { Branch } from '../types/branch';
import { saleService } from '../services/sale.service';
import { clientService } from '../services/client.service';
import { serviceService } from '../services/service.service';
import { branchService } from '../services/branch.service';
import toast from 'react-hot-toast';
import { FaTrash, FaFileExcel, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface CustomService {
  nombre: string;
  precio: number;
  descripcion: string;
}

type SortField = 'cliente' | 'patente' | 'sucursal' | 'total' | 'fecha' | 'pagado';
type SortDirection = 'asc' | 'desc';

const SaleRegistration = () => {
  const [formData, setFormData] = useState({
    clienteId: 0,
    sucursalId: 0,
    patente: '',
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportRange, setExportRange] = useState<'1m' | '3m' | '6m' | 'custom'>('1m');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [branchFilter, setBranchFilter] = useState<number | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
        patente: formData.patente,
        serviciosIds,
        serviciosPersonalizados,
        pagado,
      };

      const newSale = await saleService.createSale(saleData);
      setSales([...sales, newSale]);
      setFormData({
        clienteId: 0,
        sucursalId: 0,
        patente: '',
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

  // Función para formatear patente chilena
  const formatPatente = (value: string) => {
    // Remover caracteres no alfanuméricos
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Formato antiguo: LLLL·NN (4 letras + 2 números)
    if (cleaned.length <= 6) {
      if (cleaned.length <= 4) {
        return cleaned;
      } else {
        return cleaned.slice(0, 4) + '·' + cleaned.slice(4, 6);
      }
    }
    
    // Formato nuevo: LL·NNNN (2 letras + 4 números)
    if (cleaned.length <= 2) {
      return cleaned;
    } else {
      return cleaned.slice(0, 2) + '·' + cleaned.slice(2, 6);
    }
  };

  const handlePatenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPatente(e.target.value);
    setFormData(prev => ({
      ...prev,
      patente: formatted
    }));
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
      const data = await saleService.getSaleDetail(saleId);
      setDetailSale(data);
    } catch (err: any) {
      setDetailError(err.message || 'Error al cargar el detalle de la venta');
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
      const data = await saleService.updateSalePaymentStatus(detailSale.id, !detailSale.pagado);
      setDetailSale((prev: any) => ({ ...prev, pagado: data.pagado }));
      toast.success('Estado de pago actualizado');
      fetchSales();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el estado de pago');
    } finally {
      setIsTogglingPaid(false);
    }
  };

  const handleDeleteClick = (sale: Sale) => {
    setSaleToDelete(sale);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection(field === 'fecha' ? 'desc' : 'asc');
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="w-3 h-3 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <FaSortUp className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
      : <FaSortDown className="w-3 h-3 text-blue-600 dark:text-cyan-400" />;
  };

  const formatSaleDate = (sale: Sale) => {
    const dateStr = sale.createdAt || sale.fecha;
    const date = dateStr ? new Date(dateStr) : null;
    return date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '-';
  };

  const handleDeleteConfirm = async () => {
    if (!saleToDelete) return;
    setIsDeleting(true);
    try {
      await saleService.deleteSale(saleToDelete.id);
      toast.success('Venta eliminada');
      fetchSales();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la venta');
    } finally {
      setIsDeleting(false);
      setSaleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setSaleToDelete(null);
  };

  // Filtro + ordenación de ventas memorizado
  const filteredSales = useMemo(() => {
    const search = tableSearch.toLowerCase();
    const filtered = sales.filter((sale) => {
      if (statusFilter === 'paid' && !sale.pagado) return false;
      if (statusFilter === 'unpaid' && sale.pagado) return false;
      if (branchFilter !== 'all' && sale.sucursal?.id !== branchFilter) return false;

      const cliente = `${sale.cliente?.name ?? ''} ${sale.cliente?.apellido ?? ''}`.toLowerCase();
      const patente = sale.patente?.toLowerCase() ?? '';
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
        patente.includes(search) ||
        sucursal.includes(search) ||
        servicios.includes(search) ||
        total.includes(search) ||
        pagado.includes(search) ||
        fecha.includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'cliente': {
          const aCliente = `${a.cliente?.name ?? ''} ${a.cliente?.apellido ?? ''}`.toLowerCase();
          const bCliente = `${b.cliente?.name ?? ''} ${b.cliente?.apellido ?? ''}`.toLowerCase();
          comparison = aCliente.localeCompare(bCliente);
          break;
        }
        case 'patente':
          comparison = (a.patente ?? '').localeCompare(b.patente ?? '');
          break;
        case 'sucursal':
          comparison = (a.sucursal?.nombre ?? '').localeCompare(b.sucursal?.nombre ?? '');
          break;
        case 'total':
          comparison = Number(a.total) - Number(b.total);
          break;
        case 'pagado':
          comparison = Number(a.pagado) - Number(b.pagado);
          break;
        case 'fecha': {
          const aDate = a.createdAt || a.fecha;
          const bDate = b.createdAt || b.fecha;
          const aTs = aDate ? new Date(aDate).getTime() : 0;
          const bTs = bDate ? new Date(bDate).getTime() : 0;
          comparison = aTs - bTs;
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [sales, tableSearch, statusFilter, branchFilter, sortField, sortDirection]);

  // Paginación derivada — sin estado redundante
  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedSales = filteredSales.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Genera array de páginas a mostrar con elipsis para muchas páginas
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (safePage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
  }, [totalPages, safePage]);

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

  return (
    <div className="space-y-3">
      {/* Sales Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ventas Registradas</h2>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                <FaFileExcel className="w-4 h-4" />
                Exportar Excel
              </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 p-4">
                <div className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Rango a exportar</div>
                <div className="space-y-2 text-gray-700 dark:text-gray-200 text-sm">
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
                    className="px-3 py-1.5 text-sm rounded bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50"
                  >
                    {isExporting ? 'Exportando...' : 'Exportar'}
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <div className="xl:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={tableSearch}
                onChange={e => { setTableSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar en ventas..."
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as 'all' | 'paid' | 'unpaid'); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="paid">Pagado</option>
              <option value="unpaid">No pagado</option>
            </select>

            <select
              value={branchFilter}
              onChange={e => { setBranchFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todas las sucursales</option>
              {branches.map((branch) => (
                <option key={`filter-branch-${branch.id}`} value={branch.id}>{branch.nombre}</option>
              ))}
            </select>

            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as SortField)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="fecha">Ordenar por Fecha</option>
              <option value="cliente">Ordenar por Cliente</option>
              <option value="sucursal">Ordenar por Sucursal</option>
              <option value="total">Ordenar por Total</option>
              <option value="patente">Ordenar por Patente</option>
              <option value="pagado">Ordenar por Estado</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setSortDirection('asc')}
                className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors ${sortDirection === 'asc' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
              >
                Asc
              </button>
              <button
                onClick={() => setSortDirection('desc')}
                className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors ${sortDirection === 'desc' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
              >
                Desc
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {/* Filtro de búsqueda */}
  
        <div className="md:hidden space-y-3 p-3">
          {filteredSales.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-base bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-700">
              No hay ventas registradas
            </div>
          ) : (
            paginatedSales.map((sale) => (
              <article
                key={`mobile-${sale.id}`}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Cliente</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{`${sale.cliente.name} ${sale.cliente.apellido}`}</p>
                  </div>
                  <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${sale.pagado ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                    {sale.pagado ? 'Pagado' : 'No pagado'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Patente</p>
                    <p className="text-gray-900 dark:text-gray-100">{sale.patente || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Sucursal</p>
                    <p className="text-gray-900 dark:text-gray-100">{sale.sucursal.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Fecha</p>
                    <p className="text-gray-900 dark:text-gray-100">{formatSaleDate(sale)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-bold text-blue-600 dark:text-cyan-400">{formatCLP(Number(sale.total))}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Servicios</p>
                  <div className="space-y-1 text-sm">
                    {sale.servicios?.length > 0 && sale.servicios.map((service) => (
                      <div key={`m-service-${service.id}`} className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">{service.nombre}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">({formatCLP(Number(service.precio))})</span>
                      </div>
                    ))}
                    {sale.serviciosPersonalizados && sale.serviciosPersonalizados.length > 0 && sale.serviciosPersonalizados.map((customService, index: number) => (
                      <div key={`m-custom-${sale.id}-${index}`} className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium text-blue-600 dark:text-cyan-400">{customService.nombre}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">({formatCLP(Number(customService.precio))})</span>
                        <span className="inline-block ml-2 px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Personalizado</span>
                      </div>
                    ))}
                    {(!sale.servicios || sale.servicios.length === 0) && (!sale.serviciosPersonalizados || sale.serviciosPersonalizados.length === 0) && (
                      <span className="text-gray-400 italic">Sin servicios</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleShowDetail(sale.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-cyan-400 dark:hover:text-cyan-200 underline text-sm"
                    title="Ver detalle"
                  >
                    Ver detalle
                  </button>
                  <button
                    onClick={() => handleDeleteClick(sale)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 transition"
                    title="Eliminar"
                    aria-label="Eliminar"
                  >
                    <FaTrash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button onClick={() => handleSort('cliente')} className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-cyan-300">
                    Cliente {renderSortIcon('cliente')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button onClick={() => handleSort('patente')} className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-cyan-300">
                    Patente {renderSortIcon('patente')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button onClick={() => handleSort('sucursal')} className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-cyan-300">
                    Sucursal {renderSortIcon('sucursal')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Servicios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button onClick={() => handleSort('total')} className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-cyan-300">
                    Total {renderSortIcon('total')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button onClick={() => handleSort('pagado')} className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-cyan-300">
                    Pagado {renderSortIcon('pagado')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button onClick={() => handleSort('fecha')} className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-cyan-300">
                    Fecha {renderSortIcon('fecha')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400 text-lg">
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
                      {sale.patente || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {sale.sucursal.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                      <div className="space-y-1">
                        {/* Servicios regulares */}
                        {sale.servicios?.length > 0 && (
                          <ul className="list-disc list-inside space-y-1">
                            {sale.servicios.map((service) => (
                              <li key={service.id} className="text-sm">
                                <span className="font-medium">{service.nombre}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                  ({formatCLP(Number(service.precio))})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Servicios personalizados */}
                        {sale.serviciosPersonalizados && sale.serviciosPersonalizados.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            {sale.serviciosPersonalizados.map((customService, index: number) => (
                              <li key={`custom-${index}`} className="text-sm">
                                <span className="font-medium text-blue-600 dark:text-cyan-400">
                                  {customService.nombre}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                  ({formatCLP(Number(customService.precio))})
                                </span>
                                <span className="inline-block ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                  Personalizado
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Mensaje cuando no hay servicios */}
                        {(!sale.servicios || sale.servicios.length === 0) && 
                         (!sale.serviciosPersonalizados || sale.serviciosPersonalizados.length === 0) && (
                          <span className="text-gray-400 italic">Sin servicios</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {formatCLP(Number(sale.total))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {sale.pagado ? (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-400">Pagado</span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-400">No pagado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{formatSaleDate(sale)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowDetail(sale.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-cyan-400 dark:hover:text-cyan-200 underline"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredSales.length === 0
              ? 'Sin resultados'
              : `Mostrando ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filteredSales.length)} de ${filteredSales.length} ventas`}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Filas:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          {totalPages > 1 && (
            <nav className="flex items-center gap-1" aria-label="Paginación">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Primera página"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Página anterior"
              >
                ‹
              </button>
              {pageNumbers.map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(Number(page))}
                    aria-current={safePage === page ? 'page' : undefined}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      safePage === page
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Página siguiente"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Última página"
              >
                »
              </button>
            </nav>
          )}
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
                autoComplete='off'
                className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
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
                className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
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

            {/* Patente */}
            <div>
              <label htmlFor="patente" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Patente del Vehículo
              </label>
              <input
                type="text"
                id="patente"
                value={formData.patente}
                onChange={handlePatenteChange}
                className="mt-1 block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder="Ej: ABCD·12 o AB·1234"
                maxLength={7}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Formato: 4 letras + 2 números (LLLL·NN) o 2 letras + 4 números (LL·NNNN)
              </p>
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
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-cyan-400 dark:hover:text-cyan-300"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
                  >
                    {service.nombre} - {formatCLP(service.precio)}
                  </label>
                </div>
              ))}
            </div>

            {/* Servicios personalizados seleccionados */}
            {selectedServices.filter(service => !('id' in service)).map((service, index) => (
              <div key={index} className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{service.nombre}</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatCLP(service.precio)}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Total: {formatCLP(total)}
            </p>
          </div>

          {/* Checkbox Pagado */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pagado"
              checked={pagado}
              onChange={() => setPagado(prev => !prev)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="pagado" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
              Pagado
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
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
                    value={formatCLPInput(customService.precio)}
                    onChange={(e) => {
                      const numericValue = parseCLPInput(e.target.value);
                      setCustomService(prev => ({ ...prev, precio: numericValue }));
                    }}
                    className="mt-1 block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    placeholder="0"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Formato: pesos chilenos sin decimales
                </p>
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  value={customService.descripcion}
                  onChange={(e) => setCustomService(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCustomServiceForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-transparent rounded-md hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
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
                <div>
                  <span className="font-semibold text-lg block mb-1 text-gray-300">Patente</span>
                  <span className="text-gray-100">{detailSale.patente}</span>
                </div>
                <hr className="border-gray-600" />
                <div>
                  <span className="font-semibold text-lg block mb-2 text-gray-300">Servicios</span>
                  <ul className="ml-4 space-y-1">
                    {detailSale.servicios?.map((s: any, idx: number) => (
                      <li key={idx} className="flex justify-between">
                        <span className="text-gray-100">{s.nombre}</span>
                        <span className="font-mono text-right text-gray-100">{formatCLP(Number(s.precio))}</span>
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
                          <li key={idx} className="pl-3 border-l-4 border-cyan-400">
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-100">{sp.nombre}</span>
                              <span className="font-mono text-gray-100">{formatCLP(Number(sp.precio))}</span>
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
                  <span className="font-mono text-lg text-gray-100">{formatCLP(Number(detailSale.total))}</span>
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
                    className={`ml-4 px-3 py-1 text-xs font-semibold rounded bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition disabled:opacity-50`}
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