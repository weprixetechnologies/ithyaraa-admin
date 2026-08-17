import axiosInstance from "../axiosInstance";

/** Public: get active featured blocks. Used by frontend. */
export const getActiveFeaturedBlocks = async () => {
    const response = await axiosInstance.get("/featured-blocks/active");
    return response.data;
};

/** Admin: get all featured blocks */
export const getAllFeaturedBlocks = async () => {
    const response = await axiosInstance.get("/featured-blocks");
    return response.data;
};

/** Admin: create featured block. body: { image_url: string, ...config } */
export const createFeaturedBlock = async (body) => {
    try {
        const response = await axiosInstance.post("/featured-blocks", body);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};

/** Admin: delete featured block */
export const deleteFeaturedBlock = async (id) => {
    try {
        const response = await axiosInstance.delete(`/featured-blocks/${id}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};

/** Admin: update featured block */
export const updateFeaturedBlock = async (id, body) => {
    try {
        const response = await axiosInstance.put(`/featured-blocks/${id}`, body);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};

/** Admin: reorder. body: { order: [id1, id2, ...] } */
export const reorderFeaturedBlocks = async (body) => {
    try {
        const response = await axiosInstance.post("/featured-blocks/reorder", body);
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};
