import React from 'react';

function Logo({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'text-lg font-extrabold',
    md: 'text-2xl font-extrabold',
    lg: 'text-4xl font-extrabold',
  };

  return (
    <span className={`${sizeClasses[size]} text-brand-500 tracking-tight ${className}`}>
      floraquiz
    </span>
  );
}

export default Logo;
