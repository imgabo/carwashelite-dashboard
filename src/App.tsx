import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FaHome, FaUsers, FaTools, FaStore, FaShoppingCart, FaMoneyBillWave, FaCalendarAlt, FaTrophy, FaChartLine } from 'react-icons/fa';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ClientRegistration from './components/ClientRegistration';
import ServiceRegistration from './components/ServiceRegistration';
import BranchRegistration from './components/BranchRegistration';
import SaleRegistration from './components/SaleRegistration';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { dashboardService } from './services/dashboard.service';
import QuotationModule from './components/QuotationModule';

// Componente Dashboard
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalClients: 0,
    totalBranches: 0,
    totalServices: 0,
    recentSales: [],
    topServices: [],
    branchPerformance: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [
          totalSales,
          totalClients,
          totalBranches,
          totalServices,
          recentSales,
          topServices,
          branchPerformance,
        ] = await Promise.all([
          dashboardService.getVentasTotales(),
          dashboardService.getClientesRegistrados(),
          dashboardService.getSucursales(),
          dashboardService.getServicios(),
          dashboardService.getVentasRecientes(3),
          dashboardService.getServiciosPopulares(3),
          dashboardService.getRendimientoSucursal(),
        ]);
        setStats({
          totalSales,
          totalClients,
          totalBranches,
          totalServices,
          recentSales,
          topServices,
          branchPerformance,
        });
      } catch (error) {
        // Manejo de error
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
              <FaMoneyBillWave className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Ventas Totales</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalSales)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
              <FaUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Clientes Registrados</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <FaStore className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Sucursales</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBranches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
              <FaTools className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Servicios</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalServices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales and Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventas Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Servicio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentSales.map((sale: any) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sale.cliente ?? ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sale.servicio?.nombre ?? sale.servicio ?? ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(sale.total ?? sale.monto ?? 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sale.fecha ? new Date(sale.fecha).toLocaleDateString('es-CL') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <FaTrophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Servicios más Populares</h3>
          </div>
          <div className="space-y-4">
            {stats.topServices.map((service: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white">{service.nombre ?? service.name}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{service.cantidad ?? service.sales} ventas</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Performance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <FaChartLine className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rendimiento por Sucursal</h3>
        </div>
        <div className="space-y-4">
          {(() => {
            const maxSucursal = Math.max(...stats.branchPerformance.map((b: any) => b.total ?? b.sales ?? 0), 1);
            return stats.branchPerformance.map((branch: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-900 dark:text-white">{branch.nombre ?? branch.name}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(branch.total ?? branch.sales ?? 0)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, ((branch.total ?? branch.sales ?? 0) / maxSucursal) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated, login } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={login} />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients/register" element={<ClientRegistration />} />
        <Route path="services/register" element={<ServiceRegistration />} />
        <Route path="branches/register" element={<BranchRegistration />} />
        <Route path="sales/register" element={<SaleRegistration />} />
        <Route path="quotations" element={<QuotationModule />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="relative">
          <LoadingSpinner />
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
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
