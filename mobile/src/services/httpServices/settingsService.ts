import { httpService } from '../httpService';

export const settingsService = {
  getByKey: (key: string) => httpService.get(`/settings/${key}`),
  getWifiSettings: async (): Promise<{ wifi_name: string; wifi_password: string }> => {
    try {
      const res = await httpService.get<{ data: { wifi_name: string; wifi_password: string } }>('/settings/wifi');
      return {
        wifi_name: res?.data?.wifi_name || '',
        wifi_password: res?.data?.wifi_password || '',
      };
    } catch {
      return { wifi_name: '', wifi_password: '' };
    }
  },
};
