import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FaMoneyBillWave, FaUsers, FaStore, FaListAlt, FaChartLine, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ClientRegistration from './components/ClientRegistration';
import ServiceRegistration from './components/ServiceRegistration';
import BranchRegistration from './components/BranchRegistration';
import SalesRegistration from './components/SalesRegistration';

// Mock data for dashboard
const dashboardStats = {
  totalSales: 125000,
  totalClients: 45,
  totalBranches: 3,
  totalServices: 8,
  recentSales: [
    { id: 1, client: 'Cliente 1', service: 'Lavado Premium', amount: 200, date: '2024-03-20' },
    { id: 2, client: 'Cliente 2', service: 'Lavado Básico', amount: 100, date: '2024-03-19' },
    { id: 3, client: 'Cliente 3', service: 'Lavado Completo', amount: 300, date: '2024-03-19' },
  ],
  topServices: [
    { name: 'Lavado Premium', sales: 25 },
    { name: 'Lavado Básico', sales: 20 },
    { name: 'Lavado Completo', sales: 15 },
  ],
  branchPerformance: [
    { name: 'Sucursal Centro', sales: 50000 },
    { name: 'Sucursal Norte', sales: 45000 },
    { name: 'Sucursal Sur', sales: 30000 },
  ],
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (email: string, password: string) => {
    // TODO: Implement actual authentication logic
    console.log('Login attempt:', { email, password });
    setIsAuthenticated(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout>
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
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(dashboardStats.totalSales)}</p>
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
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalClients}</p>
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
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalBranches}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                          <FaListAlt className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Servicios</h3>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalServices}</p>
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
                            {dashboardStats.recentSales.map((sale) => (
                              <tr key={sale.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sale.client}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sale.service}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(sale.amount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sale.date}</td>
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
                        {dashboardStats.topServices.map((service, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-900 dark:text-white">{service.name}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{service.sales} ventas</span>
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
                      {dashboardStats.branchPerformance.map((branch, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-900 dark:text-white">{branch.name}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(branch.sales)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{ width: `${(branch.sales / dashboardStats.totalSales) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/register"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout>
                <ClientRegistration />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/register"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout>
                <ServiceRegistration />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/register"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout>
                <BranchRegistration />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/register"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout>
                <SalesRegistration />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
