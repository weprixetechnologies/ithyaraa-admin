import axiosInstance from '../axiosInstance';

export const getFilteredCoupons = async ({ couponCode, assignedUser, discountType, discountValue, page = 1, limit }) => {
    try {
        const res = await axiosInstance.get('/coupons/all-coupons', {
            params: {
                couponCode,
                assignedUser,
                discountType,
                discountValue,
                page,
                limit
            },
        });

        return res.data;
    } catch (err) {
        console.error('API error in getFilteredCoupons:', err);
        return { success: false, data: [] };
    }
};
export const getCouponCount = async (filters = {}) => {
    try {
        const { data } = await axiosInstance.get('/coupons/count', {
            params: {
                ...filters,
                dataType: 'coupons',
            },
        });
        console.log(data.total);

        return data;
    } catch (error) {
        console.error('Error fetching coupon count:', error);
        return { success: false, count: 0 };
    }
};


export const createCoupon = async (payload) => {
    const response = await axiosInstance.post('/coupons/create-coupon', payload);
    return response.data;
};


export const getCouponByID = async (couponID) => {
    const { data } = await axiosInstance.get(`/coupons/detail/${couponID}`);
    console.log(data);

    return data;
};

export const updateCoupon = async (couponData, couponID) => {
    const { data } = await axiosInstance.patch(`/coupons/edit-coupon/${couponID}`, couponData);
    return data;
};
