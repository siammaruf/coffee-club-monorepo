import { httpService } from "../httpService";

const kitchenStockService = {
  getAll: (params?: any) => httpService.get("/kitchen-stock", { params }),
  create: (data: any) => httpService.post("/kitchen-stock", data),
  getById: (id: string) => httpService.get(`/kitchen-stock/${id}`),
  update: (id: string, data: any) => httpService.put(`/kitchen-stock/${id}`, data),
  delete: (id: string) => httpService.delete(`/kitchen-stock/${id}`),
  getByItemId: (itemId: string) => httpService.get(`/kitchen-stock/item/${itemId}`),
  patchByItemId: (itemId: string, data: any) => httpService.patch(`/kitchen-stock/item/${itemId}`, data),
  bulkDelete: (ids: string[]) => httpService.delete('/kitchen-stock/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/kitchen-stock/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/kitchen-stock/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/kitchen-stock/${id}/permanent`),
};

export default kitchenStockService;
