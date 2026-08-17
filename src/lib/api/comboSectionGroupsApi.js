import axiosInstance from "../axiosInstance";

export const listComboSectionGroups = async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    if (params.sectionID) qs.append('sectionID', params.sectionID);
    if (params.includeProducts) qs.append('includeProducts', params.includeProducts);

    const response = await axiosInstance.get(`/admin/combo-section-groups?${qs.toString()}`);
    return response.data;
};

export const createComboSectionGroup = async (payload) => {
    try {
        const response = await axiosInstance.post('/admin/combo-section-groups', payload);
        return response.data;
    } catch (error) {
        console.error('createComboSectionGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const getComboSectionGroupByID = async (id) => {
    try {
        const response = await axiosInstance.get(`/admin/combo-section-groups/${id}`);
        return response.data;
    } catch (error) {
        console.error('getComboSectionGroupByID error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const updateComboSectionGroup = async (id, payload) => {
    try {
        const response = await axiosInstance.put(`/admin/combo-section-groups/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error('updateComboSectionGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const deleteComboSectionGroup = async (id) => {
    try {
        const response = await axiosInstance.delete(`/admin/combo-section-groups/${id}`);
        return response.data;
    } catch (error) {
        console.error('deleteComboSectionGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const addComboProductsToGroup = async (groupId, productIDs = []) => {
    try {
        const response = await axiosInstance.post(`/admin/combo-section-groups/${groupId}/products`, { productIDs });
        return response.data;
    } catch (error) {
        console.error('addComboProductsToGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const replaceComboProductsInGroup = async (groupId, productIDs = []) => {
    try {
        const response = await axiosInstance.put(`/admin/combo-section-groups/${groupId}/products`, { productIDs });
        return response.data;
    } catch (error) {
        console.error('replaceComboProductsInGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const getComboGroupProducts = async (groupId) => {
    try {
        const response = await axiosInstance.get(`/admin/combo-section-groups/${groupId}/products`);
        return response.data;
    } catch (error) {
        console.error('getComboGroupProducts error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};
