import axiosInstance from '../axiosInstance';

/**
 * Search brands by name
 * @param {string} name - Brand name to search
 * @returns {Promise<Object>} Response with brands array
 */
export const searchBrands = async (name) => {
    try {
        const response = await axiosInstance.get('/admin/brands/search/by-name', {
            params: { name }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching brands:', error);
        throw error;
    }
};

/**
 * Get brand orders
 * @param {Object} params - Query parameters
 * @param {string} params.brandID - Brand UID
 * @param {string} params.fromDate - Start date (YYYY-MM-DD)
 * @param {string} params.toDate - End date (YYYY-MM-DD)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Response with orders and pagination
 */
export const getBrandOrders = async (params) => {
    try {
        const response = await axiosInstance.get('/admin/orders/by-brand', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching brand orders:', error);
        throw error;
    }
};

