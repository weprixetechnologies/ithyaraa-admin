import axiosInstance from '../axiosInstance';

export const getAllPresaleProducts = async () => {
    const response = await axiosInstance.get('/admin/presale-products/all');
    return response.data;
};

export const searchPresaleProducts = async (searchTerm = '') => {
    const response = await axiosInstance.get('/admin/presale-products/search', {
        params: { search: searchTerm }
    });
    return response.data;
};

export const getPresaleProductDetails = async (presaleProductID) => {
    const response = await axiosInstance.get(`/admin/presale-products/${presaleProductID}`);
    return response.data;
};

export const createPresaleProduct = async (productData) => {
    const response = await axiosInstance.post('/admin/presale-products/add', productData);
    return response.data;
};

export const updatePresaleProduct = async (presaleProductID, productData) => {
    const response = await axiosInstance.put(`/admin/presale-products/${presaleProductID}`, productData);
    return response.data;
};

export const deletePresaleProduct = async (presaleProductID) => {
    const response = await axiosInstance.delete(`/admin/presale-products/${presaleProductID}`);
    return response.data;
};

export const bulkDeletePresaleProducts = async (presaleProductIDs) => {
    const response = await axiosInstance.post('/admin/presale-products/bulk-delete', { presaleProductIDs });
    return response.data;
};

