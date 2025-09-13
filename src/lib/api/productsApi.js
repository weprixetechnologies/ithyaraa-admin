import axiosInstance from "../axiosInstance";

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
    console.log('GET:', queryUrl);
    console.log('Filters:', filters);

    const start = performance.now(); // start timing
    const response = await axiosInstance.get(queryUrl);
    const end = performance.now();   // end timing

    console.log(response);
    console.log(`⏱ Request took ${(end - start).toFixed(2)} ms`);

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
    // console.log(response);

    console.log('count', response.data);

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