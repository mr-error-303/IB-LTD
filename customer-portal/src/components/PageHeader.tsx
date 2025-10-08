import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg text-center ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
      {subtitle && (
        <p className="text-gray-600 text-base">{subtitle}</p>
      )}
    </div>
  );
};

export default PageHeader;