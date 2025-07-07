import axiosInstance from '../config/axios';

export enum Period {
  CURRENT_MONTH = 'CURRENT_MONTH',
  LAST_THREE_MONTHS = 'LAST_THREE_MONTHS',
  LAST_SIX_MONTHS = 'LAST_SIX_MONTHS',
  CURRENT_YEAR = 'CURRENT_YEAR'
}

export const getPeriodLabel = (period: Period): string => {
  switch (period) {
    case Period.CURRENT_MONTH:
      return 'Mes actual';
    case Period.LAST_THREE_MONTHS:
      return 'Últimos 3 meses';
    case Period.LAST_SIX_MONTHS:
      return 'Últimos 6 meses';
    case Period.CURRENT_YEAR:
      return 'Año actual';
    default:
      return '';
  }
};

export const dashboardService = {
  getVentasTotales: (period: Period = Period.CURRENT_MONTH) => 
    axiosInstance.get('/dashboard/ventas-totales', { params: { period } }).then(r => r.data.total),
  getClientesRegistrados: (period: Period = Period.CURRENT_MONTH) => 
    axiosInstance.get('/dashboard/clientes-registrados', { params: { period } }).then(r => r.data.total ?? r.data.cantidad),
  getSucursales: (period: Period = Period.CURRENT_MONTH) => 
    axiosInstance.get('/dashboard/sucursales', { params: { period } }).then(r => r.data.total ?? r.data.cantidad),
  getServicios: (period: Period = Period.CURRENT_MONTH) => 
    axiosInstance.get('/dashboard/servicios', { params: { period } }).then(r => r.data.total ?? r.data.cantidad),
  getVentasRecientes: (limit = 3, period: Period = Period.CURRENT_MONTH) => 
    axiosInstance.get('/dashboard/ventas-recientes', { params: { limit, period } }).then(r => r.data),
  getServiciosPopulares: (limit = 3, period: Period = Period.CURRENT_MONTH) => 
    axiosInstance.get('/dashboard/servicios-populares', { params: { limit, period } })
      .then(r => Array.isArray(r.data) ? r.data : r.data.servicios ?? [])
      .then(services => services.map((s: any, index: number) => ({
        ...s,
        rank: index + 1,
        cantidad: s.cantidad ?? s.ventas ?? s.count ?? 0
      }))),
  getRendimientoSucursal: (period: Period = Period.CURRENT_MONTH) => 
    axiosInstance.get('/dashboard/rendimiento-sucursal', { params: { period } })
      .then(r => Array.isArray(r.data) ? r.data : r.data.sucursales ?? [])
      .then(branches => branches.map((b: any) => ({
        ...b,
        total: b.total ?? b.ventas ?? b.monto ?? 0,
        nombre: b.nombre ?? b.name
      })))
};