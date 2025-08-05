import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-2 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  );
};

// Componente de overlay de carga
export const LoadingOverlay = ({ text = 'Cargando...' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <LoadingSpinner size="lg" text={text} />
    </div>
  </div>
);

export default LoadingSpinner;