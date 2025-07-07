import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getInputClassName = (fieldName: keyof typeof errors) => {
    const baseClasses = "appearance-none rounded-none relative block w-full px-3 py-2 border";
    const errorClasses = errors[fieldName] ? "border-red-300" : "border-gray-300";
    const darkModeClasses = "dark:bg-gray-800 dark:text-white dark:border-gray-600";
    const focusClasses = "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10";
    const textClasses = "placeholder-gray-500 text-gray-900";
    const sizeClasses = "sm:text-sm";
    
    return `${baseClasses} ${errorClasses} ${darkModeClasses} ${focusClasses} ${textClasses} ${sizeClasses}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Crear cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={`${getInputClassName('name')} rounded-t-md`}
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={getInputClassName('email')}
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={getInputClassName('password')}
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={getInputClassName('confirmPassword')}
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
            <div>
              <label htmlFor="code" className="sr-only">
                Código de registro
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className={`${getInputClassName('code')} rounded-b-md`}
                placeholder="Código de registro"
                value={formData.code}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:disabled:opacity-40"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;