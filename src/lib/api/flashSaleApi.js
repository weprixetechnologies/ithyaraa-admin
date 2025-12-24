import axiosInstance from '../axiosInstance';

export async function listFlashSales() {
  const { data } = await axiosInstance.get('/admin/flash-sales');
  return data;
}

export async function createFlashSale(payload) {
  const { data } = await axiosInstance.post('/admin/flash-sales', payload);
  return data;
}

export async function updateFlashSale(saleID, payload) {
  const { data } = await axiosInstance.put(`/admin/flash-sales/${saleID}`, payload);
  return data;
}

export async function getFlashSaleDetail(saleID) {
  const { data } = await axiosInstance.get(`/admin/flash-sales/${saleID}`);
  return data;
}

export async function listFlashSaleItems(saleID) {
  const { data } = await axiosInstance.get(`/admin/flash-sales/${saleID}/items`);
  return data;
}

export async function setFlashSaleItems(saleID, payload) {
  // payload can be { productIDs: string[] } or { items: { productID, discountType, discountValue }[] }
  const { data } = await axiosInstance.post(`/admin/flash-sales/${saleID}/items`, payload);
  return data;
}

export async function removeFlashSaleItem(saleID, productID) {
  const { data } = await axiosInstance.delete(`/admin/flash-sales/${saleID}/items/${productID}`);
  return data;
}


