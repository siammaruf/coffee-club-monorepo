import { createAsyncThunk } from '@reduxjs/toolkit';
import { httpService } from '../httpService';
import type { GetUsersParams, User, UserResponse, UsersListResponse } from '~/types/user';

export const userService = {
  getUsers: (params?: GetUsersParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<UsersListResponse>('/users', config);
  },
  getUserById: (id: string) => httpService.get<UserResponse>(`/users/${id}`),
  getProfile: () => httpService.get<UserResponse>('/users/profile'),
  createUser: (user: Omit<User, 'id'>) => httpService.post<User>('/users', user),
  updateUser: (id: string, user: Partial<User>) => httpService.patch<User>(`/users/${id}`, user),
  deleteUser: (id: string) => httpService.delete(`/users/${id}`),
  activateUser: (id: string) => httpService.patch<User>(`/users/${id}/activate`, {}),
  deactivateUser: (id: string) => httpService.patch<User>(`/users/${id}/deactivate`, {}),
  updateUserStatus: (id: string, status: 'active' | 'inactive') => {
    return status === 'active' 
      ? userService.activateUser(id)
      : userService.deactivateUser(id);
  },
  sendResetPasswordEmail: (id: string) => httpService.post(`/users/${id}/resend-password-reset`, {}),
  changePassword: (id: string, data: { currentPassword: string; newPassword: string }) =>
    httpService.patch(`/users/${id}/change-password`, data),
  updateProfilePicture: (id: string, formData: FormData) =>
    httpService.patch(`/users/${id}/profile-picture`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
};

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params: GetUsersParams = {}, { rejectWithValue }) => {
    try {
      return await userService.getUsers(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id'>, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'user/updateUserStatus',
  async ({ id, status }: { id: string; status: 'active' | 'inactive' }, { rejectWithValue }) => {
    try {
      return await userService.updateUserStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendResetPasswordEmail = createAsyncThunk(
  'user/sendResetPasswordEmail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await userService.sendResetPasswordEmail(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);