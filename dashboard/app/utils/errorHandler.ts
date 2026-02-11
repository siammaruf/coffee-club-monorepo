import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse, ErrorResponse } from '~/types/httpService';

export const createErrorResponse = (error: AxiosError<ApiErrorResponse>): ErrorResponse => {
  const errorResponse: ErrorResponse = {
    message: 'An unexpected error occurred',
    status: 500,
  };

  if (error.response) {
    errorResponse.status = error.response.status;
    errorResponse.message = error.response.data?.message || error.message;

    switch (error.response.status) {
      case 401:
        errorResponse.message = 'Authentication required';
        break;
      case 403:
        errorResponse.message = 'Access denied';
        break;
      case 404:
        errorResponse.message = 'Resource not found';
        break;
      case 422:
        errorResponse.message = 'Validation failed';
        break;
      case 500:
        errorResponse.message = 'Server error';
        break;
    }
  } else if (error.request) {
    errorResponse.message = 'No response from server';
    errorResponse.status = 503;
  }

  return errorResponse;
};

export const handleUnauthorized = (): void => {
  // No longer redirect or remove token
  // The component using the auth state will handle redirects
};

export const handleAxiosError = (error: unknown): ErrorResponse => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      return {
        message: error.response.data.message || error.response.data.error || error.message,
        status: error.response.data.statusCode || error.response.status || 500,
        ...error.response.data 
      };
    }
    
    return {
      message: error.message,
      status: error.response?.status || 500,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
};