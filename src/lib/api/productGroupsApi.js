import axiosInstance from "../axiosInstance";

export const listProductGroups = async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    if (params.sectionID) qs.append('sectionID', params.sectionID);
    if (params.includeProducts) qs.append('includeProducts', params.includeProducts);

    const response = await axiosInstance.get(`/admin/product-groups?${qs.toString()}`);
    return response.data;
};

export const createProductGroup = async (payload) => {
    try {
        const response = await axiosInstance.post('/admin/product-groups', payload);
        return response.data;
    } catch (error) {
        console.error('createProductGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const getProductGroupByID = async (id) => {
    try {
        const response = await axiosInstance.get(`/admin/product-groups/${id}`);
        return response.data;
    } catch (error) {
        console.error('getProductGroupByID error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const updateProductGroup = async (id, payload) => {
    try {
        const response = await axiosInstance.put(`/admin/product-groups/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error('updateProductGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const deleteProductGroup = async (id) => {
    try {
        const response = await axiosInstance.delete(`/admin/product-groups/${id}`);
        return response.data;
    } catch (error) {
        console.error('deleteProductGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const addProductsToGroup = async (groupId, productIDs = []) => {
    try {
        const response = await axiosInstance.post(`/admin/product-groups/${groupId}/products`, { productIDs });
        return response.data;
    } catch (error) {
        console.error('addProductsToGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const replaceProductsInGroup = async (groupId, productIDs = []) => {
    try {
        const response = await axiosInstance.put(`/admin/product-groups/${groupId}/products`, { productIDs });
        return response.data;
    } catch (error) {
        console.error('replaceProductsInGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const getGroupProducts = async (groupId) => {
    try {
        const response = await axiosInstance.get(`/admin/product-groups/${groupId}/products`);
        return response.data;
    } catch (error) {
        console.error('getGroupProducts error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

