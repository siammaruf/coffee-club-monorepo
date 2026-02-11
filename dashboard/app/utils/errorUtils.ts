import { useState } from "react";

export interface ErrorResponse {
  message: string;
  status?: number;
  type?: 'error' | 'warning' | 'info';
}

export interface SuccessResponse {
  message: string;
  type?: 'success';
}

export type StatusMessage = ErrorResponse | SuccessResponse | null;

export const processErrorMessage = (error: any): string => {
  if (error?.message && Array.isArray(error.message)) {
    return error.message.join(', ');
  }
  
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }
  
  if (error?.error && typeof error.error === 'string') {
    return error.error;
  }
  
  if (error?.status) {
    return getHttpStatusMessage(error.status);
  }
  
  if (error?.response?.data) {
    return processErrorMessage(error.response.data);
  }
  
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const getHttpStatusMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Invalid data provided. Please check your input.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict: The resource already exists or there is a data conflict.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. The request took too long to process.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export const createErrorResponse = (error: any, defaultMessage?: string): ErrorResponse => {
  const message = processErrorMessage(error) || defaultMessage || 'An error occurred';
  
  return {
    message,
    status: error?.status || error?.response?.status || 500,
    type: 'error'
  };
};

export const createSuccessResponse = (message: string | any, defaultMessage?: string): SuccessResponse => {
  let successMessage = defaultMessage || 'Operation completed successfully';
  
  if (typeof message === 'string') {
    successMessage = message;
  } else if (message?.message && typeof message.message === 'string') {
    successMessage = message.message;
  } else if (message?.data?.message && typeof message.data.message === 'string') {
    successMessage = message.data.message;
  }
  
  return {
    message: successMessage,
    type: 'success'
  };
};

export const useStatusMessage = () => {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  
  const setError = (error: any, defaultMessage?: string) => {
    const errorResponse = createErrorResponse(error, defaultMessage);
    setStatusMessage(errorResponse);
  };
  
  const setSuccess = (message: string | any, defaultMessage?: string) => {
    const successResponse = createSuccessResponse(message, defaultMessage);
    setStatusMessage(successResponse);
  };
  
  const clearStatus = () => {
    setStatusMessage(null);
  };
  
  return {
    statusMessage,
    setError,
    setSuccess,
    clearStatus,
    isError: statusMessage?.type === 'error',
    isSuccess: statusMessage?.type === 'success'
  };
};

export const withErrorHandling = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  onError?: (error: any) => void,
  onSuccess?: (result: R) => void
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      const result = await asyncFn(...args);
      onSuccess?.(result);
      return result;
    } catch (error) {
      console.error('Error in async operation:', error);
      onError?.(error);
      return null;
    }
  };
};