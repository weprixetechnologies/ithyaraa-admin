import axiosInstance from '../axiosInstance';

export const getAllBadges = async () => {
    const response = await axiosInstance.get('/admin/product-badges');
    return response.data;
};

export const createBadge = async (badgeData) => {
    const response = await axiosInstance.post('/admin/product-badges', badgeData);
    return response.data;
};

export const updateBadge = async (id, badgeData) => {
    const response = await axiosInstance.put(`/admin/product-badges/${id}`, badgeData);
    return response.data;
};

export const deleteBadge = async (id) => {
    const response = await axiosInstance.delete(`/admin/product-badges/${id}`);
    return response.data;
};

export const getBadgeProducts = async (id) => {
    const response = await axiosInstance.get(`/admin/product-badges/${id}/products`);
    return response.data;
};

export const syncBadgeProducts = async (id, productIDs) => {
    const response = await axiosInstance.post(`/admin/product-badges/${id}/products`, { productIDs });
    return response.data;
};
