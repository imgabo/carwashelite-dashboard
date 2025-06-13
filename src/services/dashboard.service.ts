import axiosInstance from '../config/axios';

export const dashboardService = {
  getVentasTotales: () => axiosInstance.get('/dashboard/ventas-totales').then(r => r.data.total),
  getClientesRegistrados: () => axiosInstance.get('/dashboard/clientes-registrados').then(r => r.data.total ?? r.data.cantidad),
  getSucursales: () => axiosInstance.get('/dashboard/sucursales').then(r => r.data.total ?? r.data.cantidad),
  getServicios: () => axiosInstance.get('/dashboard/servicios').then(r => r.data.total ?? r.data.cantidad),
  getVentasRecientes: (limit = 3) => axiosInstance.get('/dashboard/ventas-recientes', { params: { limit } }).then(r => r.data),
  getServiciosPopulares: (limit = 3) => axiosInstance.get('/dashboard/servicios-populares', { params: { limit } }).then(r => r.data),
  getRendimientoSucursal: () => axiosInstance.get('/dashboard/rendimiento-sucursal').then(r => r.data),
}; 