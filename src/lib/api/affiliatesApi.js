import axiosInstance from '../axiosInstance';

export const getAffiliates = async (params = {}) => {
    const response = await axiosInstance.get('/admin/affiliates', { params });
    return response.data;
};

export const getAffiliateByUid = async (uid) => {
    const response = await axiosInstance.get(`/admin/affiliates/${uid}`);
    return response.data;
};

export const approveAffiliate = async (uid) => {
    const response = await axiosInstance.put(`/admin/affiliates/${uid}/approve`);
    return response.data;
};

export const rejectAffiliate = async (uid) => {
    const response = await axiosInstance.put(`/admin/affiliates/${uid}/reject`);
    return response.data;
};

export const getTransactionStatuses = async () => {
    const response = await axiosInstance.get('/admin/affiliates/transactions/statuses');
    return response.data;
};

export const updateTransactionStatus = async (txnID, status) => {
    const response = await axiosInstance.put(`/admin/affiliates/transactions/${txnID}/status`, { status });
    return response.data;
};

export const createManualTransaction = async (payload) => {
    const response = await axiosInstance.post('/admin/affiliates/transactions/manual', payload);
    return response.data;
};

export const updateCommissionPercentage = async (uid, commissionPercentage) => {
    const response = await axiosInstance.put(`/admin/affiliates/${uid}/commission`, { commissionPercentage });
    return response.data;
};
