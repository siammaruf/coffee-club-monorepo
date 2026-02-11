import { httpService } from "../httpService";

const BASE_URL = "/sales-reports";

const reportService = {
  getFinancialSummary: () => httpService.get(`${BASE_URL}/financial-summary`),
  getFilteredSummary: (params?: any) => httpService.get(`${BASE_URL}/filtered-summary`, { params }),
  getKitchenReport: () => httpService.get(`${BASE_URL}/kitchen-report`),
  generate: (data: any) => httpService.post(`${BASE_URL}/generate`, data),
  regenerate: (date: string) => httpService.post(`${BASE_URL}/regenerate/${date}`),
  getAll: (params?: any) => httpService.get(BASE_URL, { params }),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
  getDashboard: () => httpService.get(`${BASE_URL}/dashboard`),
  getSalesProgressChart: (params?: any) => httpService.get(`${BASE_URL}/charts/sales-progress`, { params }),
  getExpensesChart: (params?: any) => httpService.get(`${BASE_URL}/charts/expenses`, { params }),
  getFilteredSummaryWithParams: (params?: any) => httpService.get(`${BASE_URL}/filtered-summary`, { params }),
};

export default reportService;