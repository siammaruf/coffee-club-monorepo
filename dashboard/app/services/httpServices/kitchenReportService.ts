import { httpService } from "../httpService";

const BASE_URL = "/kitchen-reports";

const kitchenReportService = {
  getSummary: (params?: any) => httpService.get(`${BASE_URL}/summary`, { params }),
  getByDate: (date: string) => httpService.get(`${BASE_URL}/by-date/${date}`),
  getEfficiency: (params?: any) => httpService.get(`${BASE_URL}/efficiency`, { params }),
  getItemPerformance: (params?: any) => httpService.get(`${BASE_URL}/item-performance`, { params }),
  getPeakHours: (params?: any) => httpService.get(`${BASE_URL}/peak-hours`, { params }),
  getComparison: (params?: any) => httpService.get(`${BASE_URL}/comparison`, { params }),
};

export default kitchenReportService;
