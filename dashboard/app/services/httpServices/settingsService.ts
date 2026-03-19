import { httpService } from '../httpService';

interface WifiSettingsResponse {
  data: { wifi_name: string; wifi_password: string };
  status: string;
  message: string;
  statusCode: number;
}

export const settingsService = {
  getAll: () => httpService.get('/settings'),
  getByKey: (key: string) => httpService.get(`/settings/${key}`),
  update: (key: string, value: string) => httpService.put(`/settings/${key}`, { value }),
  getWifi: () => httpService.get<WifiSettingsResponse>('/settings/wifi'),
};
