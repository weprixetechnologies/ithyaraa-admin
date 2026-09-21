import axiosInstance from "../axiosInstance";

// In your productsApi.js
export const getDeletedProducts = ({ page, limit }) =>
    axiosInstance.get(`/products/deleted?page=${page}&limit=${limit}`)
        .then(res => res.data);

export const getPaginatedProducts = async ({ page = 1, limit = 10, filters = {} } = {}) => {
    const params = new URLSearchParams();

    params.append('page', page);
    params.append('limit', limit);

    for (const key in filters) {
        const value = filters[key];

        if (
            value !== undefined &&
            value !== null &&
            !(typeof value === 'string' && value.trim() === '')
        ) {
            params.append(key, value);
        }
    }

    const queryUrl = `/products/all-products?${params.toString()}`;
    const response = await axiosInstance.get(queryUrl);
    return response.data;
};




export const getProductCount = async (filters = {}) => {
    const params = new URLSearchParams();
    for (const key in filters) {
        if (filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    }

    const response = await axiosInstance.get(`/products/count-product?${params.toString()}`);
    return response.data || 0;
};

export const getProductDetails = async (productID) => {
    const response = await axiosInstance.get(`/products/details/${productID}`);
    return response.data.product; // adjust if your response structure differs
};

export const deleteProduct = async (productID) => {
    const response = await axiosInstance.delete(`/products/delete/${productID}`);
    return response.data;
};

export const bulkDeleteProducts = async (productIDs) => {
    const response = await axiosInstance.post('/products/bulk-delete', { productIDs });
    return response.data;
};

export const bulkSaleUpdate = async ({ productIDs, discountType, discountValue, updateSalePrice = false }) => {
    const response = await axiosInstance.post('/products/bulk-sale-update', {
        productIDs,
        discountType,
        discountValue,
        updateSalePrice
    });
    return response.data;
};

export const bulkAssignSection = async ({ productIDs, sectionid }) => {
    const response = await axiosInstance.post('/products/bulk-assign-section', {
        productIDs,
        sectionid
    });
    return response.data;
};

export const bulkRemoveSection = async ({ productIDs }) => {
    const response = await axiosInstance.post('/products/bulk-remove-section', {
        productIDs
    });
    return response.data;
};

export const getProductsForReorder = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryID) params.append('categoryID', filters.categoryID);
    if (filters.brandID) params.append('brandID', filters.brandID);
    
    const response = await axiosInstance.get(`/products/reorder-list?${params.toString()}`);
    return response.data;
};

export const reorderProducts = async (reorderedItems) => {
    const response = await axiosInstance.put('/products/reorder', { reorderedItems });
    return response.data;
};