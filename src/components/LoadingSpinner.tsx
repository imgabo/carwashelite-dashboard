import { useLoadingStore } from '../store/loadingStore';

export const LoadingSpinner = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full bg-black/30 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    </div>
  );
}; 