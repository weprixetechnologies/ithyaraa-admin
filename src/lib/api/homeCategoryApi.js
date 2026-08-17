import axiosInstance from "../axiosInstance";

export const getHomeCategoryTiles = async () => {
    try {
        const response = await axiosInstance.get("/admin/home-categories");
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Error fetching home category tiles:", error);
        return [];
    }
};

export const createHomeCategoryTile = async ({ categoryID, imageUrl, sortOrder }) => {
    try {
        const response = await axiosInstance.post("/admin/home-categories", {
            categoryID,
            imageUrl,
            sortOrder,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating home category tile:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
        };
    }
};

