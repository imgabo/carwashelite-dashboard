import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTicketAlt } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código de registro es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData.name, registerData.email, registerData.password, registerData.code);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 sm:-right-32 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 -left-40 sm:-left-32 w-72 sm:w-96 h-72 sm:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className={`relative w-full max-w-sm sm:max-w-md transform transition-all duration-1000 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-slate-800 bg-opacity-40 backdrop-blur-2xl border border-slate-700 border-opacity-50 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-2 sm:mb-4 shadow-lg">
              <FaUser className="text-white text-5 sm:text-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              Crear Cuenta
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Únete a CarWash Elite
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-200">
                Nombre completo
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full bg-slate-700 bg-opacity-50 border rounded-lg py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 ${
                    errors.name
                      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-300 focus:ring-opacity-30'
                      : 'border-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-30'
                  } disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 hover:bg-opacity-60`}
                />
              </div>
              {errors.name && (
                <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                  <span>✕</span> {errors.name}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                Correo electrónico
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full bg-slate-700 bg-opacity-50 border rounded-lg py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 ${
                    errors.email
                      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-300 focus:ring-opacity-30'
                      : 'border-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-30'
                  } disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 hover:bg-opacity-60`}
                />
              </div>
              {errors.email && (
                <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                  <span>✕</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Contraseña
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full bg-slate-700 bg-opacity-50 border rounded-lg py-3 pl-11 pr-11 text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-300 focus:ring-opacity-30'
                      : 'border-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-30'
                  } disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 hover:bg-opacity-60`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEye className="text-base" /> : <FaEyeSlash className="text-base" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                  <span>✕</span> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-200">
                Confirmar contraseña
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full bg-slate-700 bg-opacity-50 border rounded-lg py-3 pl-11 pr-11 text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-300 focus:ring-opacity-30'
                      : 'border-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-30'
                  } disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 hover:bg-opacity-60`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FaEye className="text-base" /> : <FaEyeSlash className="text-base" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                  <span>✕</span> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Code Input */}
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-slate-200">
                Código de registro
              </label>
              <div className="relative">
                <FaTicketAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
                <input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="ABC123"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full bg-slate-700 bg-opacity-50 border rounded-lg py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 ${
                    errors.code
                      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-300 focus:ring-opacity-30'
                      : 'border-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-30'
                  } disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 hover:bg-opacity-60`}
                />
              </div>
              {errors.code && (
                <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                  <span>✕</span> {errors.code}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl text-sm sm:text-base mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </span>
              ) : (
                'Registrarse'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm">
            <p className="text-slate-400">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="inline text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(30, 41, 59, 0.5) inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          caret-color: #e2e8f0 !important;
        }
      `}</style>
    </div>
  );
};

export default Register;