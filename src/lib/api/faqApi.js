import axiosInstance from "../axiosInstance";

const BASE = "/admin";

export const getPaginatedFaqs = async ({ page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    const response = await axiosInstance.get(`${BASE}/faqs?${params.toString()}`);
    return response.data;
};

export const getAllFaqsForReorder = async () => {
    const response = await axiosInstance.get(`${BASE}/faqs?limit=500`);
    return response.data;
};

export const createFaq = async (body) => {
    const response = await axiosInstance.post(`${BASE}/faqs`, body);
    return response.data;
};

export const getFaqById = async (id) => {
    const response = await axiosInstance.get(`${BASE}/faqs/${id}`);
    return response.data;
};

export const updateFaq = async (id, body) => {
    const response = await axiosInstance.put(`${BASE}/faqs/${id}`, body);
    return response.data;
};

export const deleteFaq = async (id) => {
    const response = await axiosInstance.delete(`${BASE}/faqs/${id}`);
    return response.data;
};

export const toggleFaq = async (id) => {
    const response = await axiosInstance.patch(`${BASE}/faqs/${id}/toggle`);
    return response.data;
};

export const reorderFaqs = async (order) => {
    const response = await axiosInstance.patch(`${BASE}/faqs/reorder`, { order });
    return response.data;
};
