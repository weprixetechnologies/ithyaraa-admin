import axiosInstance from "../axiosInstance";

export const listPresaleSectionGroups = async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    if (params.sectionID) qs.append('sectionID', params.sectionID);
    if (params.includeProducts) qs.append('includeProducts', params.includeProducts);

    const response = await axiosInstance.get(`/admin/presale-section-groups?${qs.toString()}`);
    return response.data;
};

export const createPresaleSectionGroup = async (payload) => {
    try {
        const response = await axiosInstance.post('/admin/presale-section-groups', payload);
        return response.data;
    } catch (error) {
        console.error('createPresaleSectionGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const getPresaleSectionGroupByID = async (id) => {
    try {
        const response = await axiosInstance.get(`/admin/presale-section-groups/${id}`);
        return response.data;
    } catch (error) {
        console.error('getPresaleSectionGroupByID error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const updatePresaleSectionGroup = async (id, payload) => {
    try {
        const response = await axiosInstance.put(`/admin/presale-section-groups/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error('updatePresaleSectionGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const deletePresaleSectionGroup = async (id) => {
    try {
        const response = await axiosInstance.delete(`/admin/presale-section-groups/${id}`);
        return response.data;
    } catch (error) {
        console.error('deletePresaleSectionGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const addProductsToPresaleGroup = async (groupId, presaleProductIDs = []) => {
    try {
        const response = await axiosInstance.post(`/admin/presale-section-groups/${groupId}/products`, { productIDs: presaleProductIDs });
        return response.data;
    } catch (error) {
        console.error('addProductsToPresaleGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const replaceProductsInPresaleGroup = async (groupId, presaleProductIDs = []) => {
    try {
        const response = await axiosInstance.put(`/admin/presale-section-groups/${groupId}/products`, { productIDs: presaleProductIDs });
        return response.data;
    } catch (error) {
        console.error('replaceProductsInPresaleGroup error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const getPresaleGroupProducts = async (groupId) => {
    try {
        const response = await axiosInstance.get(`/admin/presale-section-groups/${groupId}/products`);
        return response.data;
    } catch (error) {
        console.error('getPresaleGroupProducts error', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};
