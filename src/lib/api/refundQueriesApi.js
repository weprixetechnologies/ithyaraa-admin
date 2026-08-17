import axiosInstance from '../axiosInstance';

export const getRefundQueries = async (params = {}) => {
    const response = await axiosInstance.get('/order/admin/refund-queries', { params });
    return response.data;
};

export const updateRefundQueryStatus = async (refundQueryID, status) => {
    const response = await axiosInstance.put(`/order/admin/refund-queries/${refundQueryID}/status`, { status });
    return response.data;
};

export const approveReturnRequest = async (orderItemID) => {
    const response = await axiosInstance.post(`/order/admin/approve-return/${orderItemID}`);
    return response.data;
};

export const rejectReturnRequest = async (orderItemID, rejectionReason = '') => {
    const response = await axiosInstance.post(`/order/admin/reject-return/${orderItemID}`, {
        rejectionReason
    });
    return response.data;
};

export const getResolvedRefundQueries = async (params = {}) => {
    const response = await axiosInstance.get('/order/admin/refund-queries-resolved', { params });
    return response.data;
};
