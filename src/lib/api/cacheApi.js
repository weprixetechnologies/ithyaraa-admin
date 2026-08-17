import axiosInstance from "../axiosInstance";

export const getCacheScopes = async () => {
    try {
        const response = await axiosInstance.get(`/admin/cache/scopes`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const clearCache = async (scope) => {
    try {
        const response = await axiosInstance.post(`/admin/cache/clear`, { scope });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const recacheData = async (scope) => {
    try {
        const response = await axiosInstance.post(`/admin/cache/recache`, { scope });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getCacheKeys = async (pattern) => {
    try {
        const response = await axiosInstance.get(`/admin/cache/keys`, {
            params: { pattern }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getCacheData = async (key) => {
    try {
        const response = await axiosInstance.get(`/admin/cache/view`, {
            params: { key }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
