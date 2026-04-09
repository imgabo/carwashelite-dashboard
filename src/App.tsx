import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FaHome, FaUsers, FaTools, FaStore, FaShoppingCart, FaMoneyBillWave, FaCalendarAlt, FaTrophy, FaChartLine, FaClock, FaChartPie, FaArrowUp } from 'react-icons/fa';
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
import { useState, useEffect, useTransition, useMemo } from 'react';
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

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('es-CL', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date()),
    []
  );

  const topServiceName = useMemo(() => {
    const service = (stats.topServices as any[])[0];
    return service?.nombre ?? service?.name ?? 'Sin datos';
  }, [stats.topServices]);

  const chartPalette = ['#06b6d4', '#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899'];

  const recentSalesChartData = useMemo(() => {
    const points = [...(stats.recentSales as any[])]
      .map((sale, index) => {
        const rawDate = sale.fecha ? new Date(sale.fecha) : null;
        const amount = Number(sale.total ?? sale.monto ?? 0);
        return {
          id: sale.id ?? index,
          amount,
          label: rawDate && !isNaN(rawDate.getTime())
            ? rawDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
            : `#${index + 1}`,
          ts: rawDate && !isNaN(rawDate.getTime()) ? rawDate.getTime() : index,
        };
      })
      .sort((a, b) => a.ts - b.ts);

    return points;
  }, [stats.recentSales]);

  const salesLinePath = useMemo(() => {
    if (!recentSalesChartData.length) return '';
    const width = 320;
    const height = 140;
    const max = Math.max(...recentSalesChartData.map(p => p.amount), 1);
    const stepX = recentSalesChartData.length > 1 ? width / (recentSalesChartData.length - 1) : width;
    return recentSalesChartData
      .map((point, i) => {
        const x = i * stepX;
        const y = height - (point.amount / max) * (height - 12) - 6;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }, [recentSalesChartData]);

  const branchDistribution = useMemo(() => {
    const branches = (stats.branchPerformance as any[]).map((branch, index) => ({
      id: branch.id ?? index,
      name: branch.nombre ?? branch.name ?? `Sucursal ${index + 1}`,
      value: Number(branch.total ?? branch.sales ?? 0),
      color: chartPalette[index % chartPalette.length],
    }));
    const total = branches.reduce((acc, item) => acc + item.value, 0) || 1;
    return {
      total,
      items: branches,
    };
  }, [stats.branchPerformance]);

  const branchDonutStyle = useMemo(() => {
    if (!branchDistribution.items.length) {
      return { background: 'conic-gradient(#334155 0% 100%)' };
    }
    let cursor = 0;
    const stops = branchDistribution.items.map((item) => {
      const percentage = (item.value / branchDistribution.total) * 100;
      const start = cursor;
      const end = cursor + percentage;
      cursor = end;
      return `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    });
    return { background: `conic-gradient(${stops.join(', ')})` };
  }, [branchDistribution]);

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
    <div className={`space-y-6 sm:space-y-8 transition-opacity duration-300 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      {/* Welcome Section with improved design */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 sm:p-8 text-slate-900 dark:text-slate-100 shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/20 text-xs uppercase tracking-widest text-blue-700 dark:text-cyan-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Actualizado en tiempo real
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">Panel de Control</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base">{todayLabel} · Visión ejecutiva de tu operación</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Periodo activo</p>
                  <p className="text-sm font-semibold">{getPeriodLabel(selectedPeriod)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Venta acumulada</p>
                  <p className="text-sm font-semibold">{formatCurrency(stats.totalSales)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Top servicio</p>
                  <p className="text-sm font-semibold truncate">{topServiceName}</p>
                </div>
              </div>
            </div>

            <div className="w-full xl:w-auto flex flex-col sm:flex-row xl:flex-col gap-3">
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 w-full xl:w-72">
                <div className="flex items-center px-4 py-2 w-full">
                  <FaClock className="text-blue-600 dark:text-cyan-300 mr-2" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value as Period)}
                    className="bg-transparent text-slate-900 dark:text-slate-100 text-sm font-medium border-0 focus:ring-0 appearance-none cursor-pointer pr-8 pl-0 w-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23475569' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
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

              <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 min-w-[220px]">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200 text-sm font-semibold">
                  <FaArrowUp className="w-3 h-3" />
                  Rendimiento operativo
                </div>
                <p className="text-emerald-900 dark:text-emerald-100 text-xs mt-1">Tienes {stats.totalClients} clientes y {stats.totalServices} servicios activos en el periodo seleccionado.</p>
              </div>
            </div>
          </div>
        </div>
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

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                  <FaChartLine className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tendencia de Ventas</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-300">Últimas ventas</span>
            </div>
          </div>
          <div className="p-6">
            {recentSalesChartData.length > 0 ? (
              <>
                <div className="h-44 sm:h-52 w-full rounded-xl bg-gradient-to-b from-blue-50 to-transparent dark:from-cyan-900/10 dark:to-transparent p-3">
                  <svg viewBox="0 0 320 140" className="w-full h-full" preserveAspectRatio="none" aria-label="Tendencia de ventas">
                    <defs>
                      <linearGradient id="salesLine" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <path d={salesLinePath} fill="none" stroke="url(#salesLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {recentSalesChartData.map((point) => (
                    <div key={point.id} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 px-3 py-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{point.label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(point.amount)}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-44 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40">
                Sin datos de ventas recientes
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10">
                <FaChartPie className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribución por Sucursal</h3>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="mx-auto relative h-44 w-44 rounded-full" style={branchDonutStyle}>
              <div className="absolute inset-[18%] rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-center px-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(branchDistribution.total)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {branchDistribution.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{((item.value / branchDistribution.total) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
            {(stats.topServices as any[]).length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Aun no hay servicios con datos suficientes para mostrar ranking.
              </div>
            )}
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
          {(stats.branchPerformance as any[]).length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Aun no hay ventas por sucursal para este periodo.
            </div>
          )}
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
