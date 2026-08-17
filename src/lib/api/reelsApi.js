import axiosInstance from "../axiosInstance";

// Prefix for all reels routes
const BASE_URL = "/admin/reels";

/**
 * Get all reels for admin
 */
export const getAllReels = async () => {
    try {
        const response = await axiosInstance.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching reels:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Add a new reel
 */
export const createReel = async (reelData) => {
    try {
        const response = await axiosInstance.post(BASE_URL, reelData);
        return response.data;
    } catch (error) {
        console.error("Error creating reel:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Get reel by ID
 */
export const getReelByID = async (id) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching reel:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Update a reel
 */
export const updateReel = async (id, reelData) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/${id}`, reelData);
        return response.data;
    } catch (error) {
        console.error("Error updating reel:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Delete a reel
 */
export const deleteReel = async (id) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting reel:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Update reel status (enable/disable)
 */
export const updateReelStatus = async (id, isActive) => {
    try {
        const response = await axiosInstance.patch(`${BASE_URL}/${id}/status`, { isActive });
        return response.data;
    } catch (error) {
        console.error("Error updating reel status:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Reorder reels
 */
export const reorderReels = async (positions) => {
    try {
        const response = await axiosInstance.patch(`${BASE_URL}/reorder`, { positions });
        return response.data;
    } catch (error) {
        console.error("Error reordering reels:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};
