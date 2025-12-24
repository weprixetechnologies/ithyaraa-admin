// /lib/api/offerApi.js
import axiosInstance from './../axiosInstance'; // Adjust path as needed

export const getPaginatedOffers = async ({ page = 1, limit = 10, filters = {} } = {}) => {
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

    const queryUrl = `/offer/all-offers?${params.toString()}`;
    console.log('GET:', queryUrl); // ✅ Logs the full query string
    console.log('Filters:', filters); // 🔍 Logs the filter object

    const response = await axiosInstance.get(queryUrl);
    return response.data;
};

export const getOfferCount = async (filters = {}) => {
    const params = new URLSearchParams();

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

    const queryUrl = `/offer/count?${params.toString()}`;
    console.log('GET:', queryUrl);

    const response = await axiosInstance.get(queryUrl);
    return response.data;
};

export const deleteOffer = async (offerID) => {
    const response = await axiosInstance.delete(`/offer/delete/${offerID}`);
    return response.data;
};
