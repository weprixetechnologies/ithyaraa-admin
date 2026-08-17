import axiosInstance from "../axiosInstance";

export const listCustomImageSections = async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    const res = await axiosInstance.get(`/admin/custom-image-sections?${qs.toString()}`);
    return res.data;
};

export const createCustomImageSection = async (payload) => {
    const res = await axiosInstance.post('/admin/custom-image-sections', payload);
    return res.data;
};

export const getCustomImageSection = async (id) => {
    const res = await axiosInstance.get(`/admin/custom-image-sections/${id}`);
    return res.data;
};

export const updateCustomImageSection = async (id, payload) => {
    const res = await axiosInstance.put(`/admin/custom-image-sections/${id}`, payload);
    return res.data;
};

export const deleteCustomImageSection = async (id) => {
    const res = await axiosInstance.delete(`/admin/custom-image-sections/${id}`);
    return res.data;
};

export const addImagesToSection = async (sectionID, images = []) => {
    const res = await axiosInstance.post(`/admin/custom-image-sections/${sectionID}/images`, { images });
    return res.data;
};

export const listImagesForSection = async (sectionID) => {
    const res = await axiosInstance.get(`/admin/custom-image-sections/${sectionID}/images`);
    return res.data;
};

export const updateSectionImage = async (id, payload) => {
    try {
        const res = await axiosInstance.put(`/admin/custom-image-sections/images/${id}`, payload);
        return res.data;
    } catch (err) {
        console.error('updateSectionImage error', err);
        return { success: false, error: err.response?.data?.message || err.message };
    }
};

export const deleteSectionImage = async (id) => {
    try {
        const res = await axiosInstance.delete(`/admin/custom-image-sections/images/${id}`);
        return res.data;
    } catch (err) {
        console.error('deleteSectionImage error', err);
        return { success: false, error: err.response?.data?.message || err.message };
    }
};

