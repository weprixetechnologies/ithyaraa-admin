import axiosInstance from "../axiosInstance";

export const listOfferSectionItems = async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.type) qs.append('type', params.type);
    const res = await axiosInstance.get(`/offer-section-items?${qs.toString()}`);
    return res.data;
};

export const createOfferSectionItem = async (payload) => {
    const res = await axiosInstance.post('/admin/offer-section-items', payload);
    return res.data;
};

export const reorderOfferSectionItems = async (items = []) => {
    const res = await axiosInstance.patch('/admin/offer-section-items/reorder', { items });
    return res.data;
};

export const deleteOfferSectionItem = async (id) => {
    const res = await axiosInstance.delete(`/admin/offer-section-items/${id}`);
    return res.data;
};

export const getOfferSectionItem = async (id) => {
    const res = await axiosInstance.get(`/admin/offer-section-items/${id}`);
    return res.data;
};

export const updateOfferSectionItem = async (id, payload) => {
    const res = await axiosInstance.put(`/admin/offer-section-items/${id}`, payload);
    return res.data;
};

export const clearOfferSectionItemsCache = async () => {
    const res = await axiosInstance.delete('/admin/offer-section-items/cache');
    return res.data;
};
