import React from 'react';

const FormButton = ({
  type = 'button',
  variant = 'primary', // primary, secondary, danger, success, outline
  size = 'md', // sm, md, lg
  children,
  loading = false,
  disabled = false,
  icon,
  className = '',
  onClick,
  ...props
}) => {

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white border-transparent',
    secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white border-transparent',
    outline: 'bg-white hover:bg-gray-50 focus:ring-blue-500 text-gray-700 border-gray-300'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  const loadingSpinner = loading ? (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ) : null;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading && loadingSpinner}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default FormButton;
