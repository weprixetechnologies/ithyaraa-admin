import axiosInstance from "../axiosInstance";

/** Public: get active slider banners (mobile + desktop). Used by frontend. */
export const getActiveSliderBanners = async () => {
    const response = await axiosInstance.get("/slider-banners/active");
    return response.data;
};

/** Admin: get all slider banners, optional ?type=mobile|desktop */
export const getAllSliderBanners = async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const url = searchParams ? `slider-banners?${searchParams}` : "slider-banners";
    const response = await axiosInstance.get(url);
    return response.data;
};

/** Admin: create slider banner. body: { type: 'mobile'|'desktop', image_url: string } */
export const createSliderBanner = async (body) => {
    try {
        const response = await axiosInstance.post("/slider-banners", body);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};

/** Admin: delete slider banner */
export const deleteSliderBanner = async (id) => {
    try {
        const response = await axiosInstance.delete(`/slider-banners/${id}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};

/** Admin: update slider banner config */
export const updateSliderBanner = async (id, body) => {
    try {
        const response = await axiosInstance.put(`/slider-banners/${id}`, body);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};

/** Admin: reorder. body: { type: 'mobile'|'desktop', order: [id1, id2, ...] } */
export const reorderSliderBanners = async (body) => {
    try {
        const response = await axiosInstance.post("/slider-banners/reorder", body);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};
