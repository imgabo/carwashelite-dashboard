import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { FaHome, FaUsers, FaTools, FaStore, FaShoppingCart, FaSignOutAlt, FaMoneyBillWave, FaClock, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTokenValidation } from '../hooks/useTokenValidation';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { 
    formatTimeRemaining, 
    isTokenExpiringSoon, 
    isAutoRefreshing, 
    tokenStatus, 
    shouldShowWarning 
  } = useTokenValidation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome className="w-5 h-5" /> },
    { path: '/clients/register', label: 'Clientes', icon: <FaUsers className="w-5 h-5" /> },
    { path: '/services/register', label: 'Servicios', icon: <FaTools className="w-5 h-5" /> },
    { path: '/branches/register', label: 'Sucursales', icon: <FaStore className="w-5 h-5" /> },
    { path: '/sales/register', label: 'Ventas', icon: <FaShoppingCart className="w-5 h-5" /> },
    { path: '/quotations', label: 'Cotizaciones', icon: <FaMoneyBillWave className="w-5 h-5" /> },
  ];

  // Función para obtener el color del indicador de sesión
  const getSessionIndicatorColor = () => {
    switch (tokenStatus) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSessionIcon = () => {
    if (isAutoRefreshing) {
      return <FaSync className="w-3 h-3 mr-2 animate-spin" />;
    }
    if (tokenStatus === 'critical') {
      return <FaExclamationTriangle className="w-3 h-3 mr-2" />;
    }
    return <FaClock className="w-3 h-3 mr-2" />;
  };

  const getSessionMessage = () => {
    if (isAutoRefreshing) {
      return 'Renovando...';
    }
    return `Sesión: ${formatTimeRemaining()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed h-full w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">CarWash Elite</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive(item.path)
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Token Status */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className={`flex items-center px-3 py-2 text-xs rounded-md mb-2 ${getSessionIndicatorColor()}`}>
              {getSessionIcon()}
              <span>{getSessionMessage()}</span>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="ml-3">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session Warning/Critical Notification */}
      {shouldShowWarning && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded shadow-lg max-w-sm ${
          tokenStatus === 'critical' 
            ? 'bg-red-100 border-l-4 border-red-500 text-red-700' 
            : 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
        }`}>
          <div className="flex items-start">
            <FaExclamationTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                {tokenStatus === 'critical' ? 'Sesión crítica' : 'Sesión próxima a expirar'}
              </p>
              <p className="text-sm">
                {isAutoRefreshing 
                  ? 'Renovando automáticamente tu sesión...' 
                  : `Tu sesión expirará en ${formatTimeRemaining()}. ${tokenStatus === 'critical' ? 'Guarda tu trabajo inmediatamente.' : 'Se renovará automáticamente.'}`
                }
              </p>
              {isAutoRefreshing && (
                <div className="flex items-center mt-2">
                  <FaSync className="w-3 h-3 mr-2 animate-spin" />
                  <span className="text-xs">Renovando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh Success Notification */}
      {isAutoRefreshing && (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg">
          <div className="flex items-center">
            <FaSync className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-sm font-medium">Renovando sesión automáticamente...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;