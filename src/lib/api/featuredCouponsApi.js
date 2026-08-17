import axiosInstance from "../axiosInstance";

export const createFeaturedCoupon = async (payload) => {
    try {
        const res = await axiosInstance.post('/featured-coupons', payload);
        return res.data;
    } catch (error) {
        console.error("Error creating featured coupon:", error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const getAllFeaturedCoupons = async () => {
    try {
        const res = await axiosInstance.get('/featured-coupons');
        return res.data;
    } catch (error) {
        console.error("Error fetching featured coupons:", error);
        return { success: false, error: error.response?.data?.message || error.message, data: [] };
    }
};

export const getFeaturedCouponById = async (id) => {
    try {
        const res = await axiosInstance.get(`/featured-coupons/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching featured coupon:", error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const updateFeaturedCoupon = async (id, payload) => {
    try {
        const res = await axiosInstance.put(`/featured-coupons/${id}`, payload);
        return res.data;
    } catch (error) {
        console.error("Error updating featured coupon:", error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

export const deleteFeaturedCoupon = async (id) => {
    try {
        const res = await axiosInstance.delete(`/featured-coupons/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error deleting featured coupon:", error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};
