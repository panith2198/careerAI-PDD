import React from 'react';

export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8 ${className}`}>
      {children}
    </div>
  );
}
