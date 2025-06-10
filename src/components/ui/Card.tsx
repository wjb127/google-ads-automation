import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  padding = 'md' 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={clsx(
      'bg-white rounded-lg shadow-sm border border-gray-200',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  title, 
  subtitle, 
  action,
  className 
}) => {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={clsx('text-gray-700', className)}>
      {children}
    </div>
  );
}; 