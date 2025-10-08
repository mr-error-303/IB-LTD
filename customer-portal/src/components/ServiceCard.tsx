import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon: LucideIcon;
  iconColor: string;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  iconColor,
  onClick,
  className = '',
  size = 'small'
}) => {
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4'
  };

  const iconSizes = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14'
  };

  const iconSizesIcon = {
    small: 'h-6 w-6',
    medium: 'h-7 w-7'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${sizeClasses[size]} ${className}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`bg-gradient-to-br ${iconColor} rounded-full ${iconSizes[size]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md mb-3`}>
          <Icon className={`${iconSizesIcon[size]} text-white`} />
        </div>
        <h4 className="text-gray-800 font-semibold text-xs leading-tight mb-1">{title}</h4>
        {subtitle && (
          <h4 className="text-gray-800 font-semibold text-xs leading-tight mb-2">{subtitle}</h4>
        )}
        {description && (
          <p className="text-gray-500 text-xs text-center">{description}</p>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;