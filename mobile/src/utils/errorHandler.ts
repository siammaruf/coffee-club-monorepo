import { Alert } from 'react-native';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/HttpService';

export const handleAxiosError = (error: unknown): Error => {
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Handle different status codes
    switch (axiosError.response?.status) {
      case 400:
        return new Error(axiosError.response?.data?.message || 'Bad Request');
      case 401:
        return new Error(axiosError.response?.data?.message || 'Unauthorized');
      case 403:
        Alert.alert('Access Denied', 'You do not have permission to perform this action.');
        return new Error(axiosError.response?.data?.message || 'Forbidden');
      case 404:
        return new Error(axiosError.response?.data?.message || 'Not Found');
      case 422:
        return new Error(axiosError.response?.data?.message || 'Validation Error');
      case 429:
        Alert.alert('Rate Limit', 'Too many requests. Please try again later.');
        return new Error('Too Many Requests');
      case 500:
      case 502:
      case 503:
      case 504:
        Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
        return new Error('Server Error');
      default:
        return new Error(axiosError.response?.data?.message || axiosError.message || 'An error occurred');
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('An unknown error occurred');
};