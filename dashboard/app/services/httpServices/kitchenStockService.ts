import { httpService } from "../httpService";

const kitchenStockService = {
  getAll: () => httpService.get("/kitchen-stock"),
  create: (data: any) => httpService.post("/kitchen-stock", data),
  getById: (id: string) => httpService.get(`/kitchen-stock/${id}`),
  update: (id: string, data: any) => httpService.put(`/kitchen-stock/${id}`, data),
  delete: (id: string) => httpService.delete(`/kitchen-stock/${id}`),
  getByItemId: (itemId: string) => httpService.get(`/kitchen-stock/item/${itemId}`),
  patchByItemId: (itemId: string, data: any) => httpService.patch(`/kitchen-stock/item/${itemId}`, data),
};

export default kitchenStockService;
