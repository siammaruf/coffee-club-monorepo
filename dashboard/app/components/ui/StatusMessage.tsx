import React from 'react';
import type { StatusMessage as StatusMessageType } from '~/utils/errorUtils';

interface StatusMessageProps {
  status: StatusMessageType;
  className?: string;
  onDismiss?: () => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ 
  status, 
  className = '', 
  onDismiss 
}) => {
  if (!status) return null;
  
  const baseClasses = 'px-4 py-[10px] rounded-md border leading-[10px]';
  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };
  
  const statusType = status.type || 'info';
  
  return (
    <div className={`${baseClasses} ${typeClasses[statusType]} ${className}`}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{status.message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};