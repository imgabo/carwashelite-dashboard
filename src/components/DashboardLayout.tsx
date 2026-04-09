import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { FaHome, FaUsers, FaTools, FaStore, FaShoppingCart, FaSignOutAlt, FaMoneyBillWave, FaClock, FaExclamationTriangle, FaSync, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTokenValidation } from '../hooks/useTokenValidation';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
    formatTimeRemaining, 
    isAutoRefreshing, 
    tokenStatus, 
    shouldShowWarning 
  } = useTokenValidation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  const renderSidebarContent = () => (
    <div className="relative flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
      <div className="relative p-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            CW
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">CarWash Elite</h1>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Control Center</p>
          </div>
        </div>
      </div>

      <nav className="relative flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border ${
                active
                  ? 'bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-500/20 text-blue-700 dark:text-cyan-200'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                active
                  ? 'bg-blue-100 dark:bg-cyan-400/20 text-blue-700 dark:text-cyan-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200'
              }`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500 dark:bg-cyan-300"></span>}
            </button>
          );
        })}
      </nav>

        <div className="relative p-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-2">Estado de sesión</p>
          <div className={`flex items-center px-2.5 py-2 text-xs rounded-lg ${getSessionIndicatorColor()}`}>
            {getSessionIcon()}
            <span>{getSessionMessage()}</span>
          </div>
        </div>

        <button
          onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 dark:text-red-200 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-black text-xs flex items-center justify-center">CW</span>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">CarWash Elite</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-md text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-72 shadow-2xl z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/45"
        />
        <aside className={`relative h-full w-[88%] max-w-sm shadow-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {renderSidebarContent()}
        </aside>
      </div>

      {/* Session Warning/Critical Notification */}
      {shouldShowWarning && (
        <div className={`fixed top-20 md:top-4 left-4 right-4 md:left-auto md:right-4 z-50 p-4 rounded shadow-lg md:max-w-sm ${
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
      <div className="md:ml-72 p-4 sm:p-6 md:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;