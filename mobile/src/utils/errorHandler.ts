import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/HttpService';

export const handleAxiosError = (error: unknown): Error => {
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Handle different status codes — return descriptive errors without UI alerts
    // to avoid alert storms when multiple requests fail simultaneously.
    switch (axiosError.response?.status) {
      case 400:
        return new Error(axiosError.response?.data?.message || 'Bad Request');
      case 401:
        return new Error(axiosError.response?.data?.message || 'Session expired. Please log in again.');
      case 403:
        return new Error(axiosError.response?.data?.message || 'Access Denied');
      case 404:
        return new Error(axiosError.response?.data?.message || 'Not Found');
      case 422:
        return new Error(axiosError.response?.data?.message || 'Validation Error');
      case 429:
        return new Error('Too Many Requests. Please try again later.');
      case 500:
      case 502:
      case 503:
      case 504:
        return new Error('Server Error. Please try again later.');
      default:
        return new Error(axiosError.response?.data?.message || axiosError.message || 'An error occurred');
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('An unknown error occurred');
};
