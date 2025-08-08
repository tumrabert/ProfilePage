'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password, formData.rememberMe);
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || 'Login failed');
      }
    } catch {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-lock text-white"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Login</h2>
                <p className="text-gray-400 text-sm">Access portfolio management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              disabled={isLoading}
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          {/* Username/Email Field */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username or Email
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors pl-11"
                placeholder="Enter username or email"
                disabled={isLoading}
                autoComplete="username"
              />
              <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors pl-11 pr-11"
                placeholder="Enter password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={isLoading}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="sr-only"
                disabled={isLoading}
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                formData.rememberMe 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-400 hover:border-gray-300'
              }`}>
                {formData.rememberMe && (
                  <i className="fas fa-check text-white text-xs"></i>
                )}
              </div>
              <span className="text-gray-300 text-sm">
                Remember me for 7 days
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login
              </div>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Secure authentication with JWT tokens
            </p>
            <div className="flex items-center justify-center mt-2 space-x-4 text-xs text-gray-600">
              <span className="flex items-center">
                <i className="fas fa-shield-alt mr-1"></i>
                Encrypted
              </span>
              <span className="flex items-center">
                <i className="fas fa-clock mr-1"></i>
                Auto-expires
              </span>
              <span className="flex items-center">
                <i className="fas fa-user-shield mr-1"></i>
                Admin Only
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}