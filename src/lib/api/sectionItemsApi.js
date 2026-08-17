import axiosInstance from "../axiosInstance";

export const listSectionItems = async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.type) qs.append('type', params.type);
    const res = await axiosInstance.get(`/section-items?${qs.toString()}`);
    return res.data;
};

export const createSectionItem = async (payload) => {
    const res = await axiosInstance.post('/admin/section-items', payload);
    return res.data;
};

export const reorderSectionItems = async (items = []) => {
    const res = await axiosInstance.patch('/admin/section-items/reorder', { items });
    return res.data;
};

export const deleteSectionItem = async (id) => {
    const res = await axiosInstance.delete(`/admin/section-items/${id}`);
    return res.data;
};

export const getSectionItem = async (id) => {
    const res = await axiosInstance.get(`/admin/section-items/${id}`);
    return res.data;
};

export const updateSectionItem = async (id, payload) => {
    const res = await axiosInstance.put(`/admin/section-items/${id}`, payload);
    return res.data;
};

export const clearSectionItemsCache = async () => {
    const res = await axiosInstance.delete('/admin/section-items/cache');
    return res.data;
};

