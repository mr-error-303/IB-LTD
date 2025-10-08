import React from 'react';

interface ServiceSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
};

export default ServiceSection;