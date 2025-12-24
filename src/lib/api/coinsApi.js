import axiosInstance from '../axiosInstance';

export async function fetchCoinTransactions(params = {}) {
  const res = await axiosInstance.get('/admin/coins/transactions', { params });
  return res.data;
}


