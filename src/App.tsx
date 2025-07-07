import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FaHome, FaUsers, FaTools, FaStore, FaShoppingCart, FaMoneyBillWave, FaCalendarAlt, FaTrophy, FaChartLine, FaClock } from 'react-icons/fa';
import Login from './components/Login';
import Register from './components/Register';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ClientRegistration from './components/ClientRegistration';
import ServiceRegistration from './components/ServiceRegistration';
import BranchRegistration from './components/BranchRegistration';
import SaleRegistration from './components/SaleRegistration';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, useTransition } from 'react';
import { dashboardService, Period, getPeriodLabel } from './services/dashboard.service';
import QuotationModule from './components/QuotationModule';

// Componente Dashboard
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(Period.CURRENT_MONTH);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalClients: 0,
    totalBranches: 0,
    totalServices: 0,
    recentSales: [],
    topServices: [],
    branchPerformance: [],
  });

  const fetchDashboardData = async (period: Period) => {
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
        dashboardService.getVentasTotales(period),
        dashboardService.getClientesRegistrados(period),
        dashboardService.getSucursales(period),
        dashboardService.getServicios(period),
        dashboardService.getVentasRecientes(5, period),
        dashboardService.getServiciosPopulares(5, period),
        dashboardService.getRendimientoSucursal(period),
      ]);
      
      startTransition(() => {
        setStats({
          totalSales,
          totalClients,
          totalBranches,
          totalServices,
          recentSales,
          topServices,
          branchPerformance,
        });
      });
    } catch (error) {
      // Manejo de error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  useEffect(() => {
    fetchDashboardData(selectedPeriod);
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Ventas Totales',
      value: stats.totalSales,
      format: formatCurrency,
      icon: <FaMoneyBillWave className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-500/5 to-purple-500/5 dark:from-indigo-900/50 dark:to-purple-900/50'
    },
    {
      title: 'Clientes Registrados',
      value: stats.totalClients,
      format: (v: number) => v.toString(),
      icon: <FaUsers className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/5 to-emerald-500/5 dark:from-green-900/50 dark:to-emerald-900/50'
    },
    {
      title: 'Sucursales',
      value: stats.totalBranches,
      format: (v: number) => v.toString(),
      icon: <FaStore className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/5 to-cyan-500/5 dark:from-blue-900/50 dark:to-cyan-900/50'
    },
    {
      title: 'Servicios',
      value: stats.totalServices,
      format: (v: number) => v.toString(),
      icon: <FaTools className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/5 to-pink-500/5 dark:from-purple-900/50 dark:to-pink-900/50'
    }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`space-y-8 p-6 transition-opacity duration-300 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      {/* Welcome Section with improved design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Panel de Control</h1>
              <p className="text-purple-100">Gestiona tu negocio de manera eficiente</p>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
              <div className="flex items-center px-4 py-2">
                <FaClock className="text-purple-200 mr-2" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value as Period)}
                  className="bg-transparent text-white text-sm font-medium border-0 focus:ring-0 appearance-none cursor-pointer pr-8 pl-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right .25rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  {Object.values(Period).map((period) => (
                    <option key={period} value={period} className="text-gray-900">
                      {getPeriodLabel(period)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center space-x-2 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
            <span className="text-purple-100">Actualizado en tiempo real</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 -mt-10 mr-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl"></div>
      </div>

      {/* Stats Cards with improved design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={stat.title}
            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-500 ease-in-out hover:shadow-xl hover:transform hover:-translate-y-1 ${
              isPending ? 'scale-95 opacity-60' : 'scale-100 opacity-100'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
            <div className="relative flex items-center">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 transition-all duration-500">
                  {stat.format(stat.value)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales and Top Services with improved design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-lg">
                  <FaCalendarAlt className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ventas Recientes</h3>
              </div>
              <span className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 rounded-full">
                Últimas 5 ventas
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr key="header-row">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Servicio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentSales.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sale.cliente ?? ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sale.servicio?.nombre ?? sale.servicio ?? ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">{formatCurrency(sale.total ?? sale.monto ?? 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sale.fecha ? new Date(sale.fecha).toLocaleDateString('es-CL') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/10 dark:bg-yellow-400/10 rounded-lg">
                  <FaTrophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Servicios más Populares</h3>
              </div>
              <span className="px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 rounded-full">
                Top 5 servicios
              </span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {stats.topServices.map((service: any) => (
              <div key={service.id ?? `service-${service.nombre ?? service.name}`} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold text-sm">
                    {service.position ?? service.rank ?? 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{service.nombre ?? service.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{service.cantidad ?? service.sales}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">ventas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Performance with improved design */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
                <FaChartLine className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rendimiento por Sucursal</h3>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {(() => {
            const maxSucursal = Math.max(...stats.branchPerformance.map((b: any) => b.total ?? b.sales ?? 0), 1);
            return stats.branchPerformance.map((branch: any) => (
              <div key={branch.id ?? `branch-${branch.nombre ?? branch.name}`} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{branch.nombre ?? branch.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(branch.total ?? branch.sales ?? 0)}</span>
                </div>
                <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.min(100, ((branch.total ?? branch.sales ?? 0) / maxSucursal) * 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                  </div>
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

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register />
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
