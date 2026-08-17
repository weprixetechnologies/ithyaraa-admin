import axiosInstance from "../axiosInstance";

// Get all sections with pagination (Admin)
export const getPaginatedHomepageSections = async ({ page = 1, limit = 10, sortBy = 'position', sortDir = 'ASC' } = {}) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    params.append("sortBy", sortBy);
    params.append("sortDir", sortDir);

    const response = await axiosInstance.get(`homepage-sections?${params.toString()}`);
    return response.data;
};

// Create a new homepage section
export const createHomepageSection = async (sectionData) => {
    try {
        const response = await axiosInstance.post("/homepage-sections", sectionData);
        return response.data;
    } catch (error) {
        console.error("Error creating homepage section:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Get section by ID
export const getHomepageSectionByID = async (id) => {
    try {
        const response = await axiosInstance.get(`/homepage-sections/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching homepage section:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Update section
export const updateHomepageSection = async (id, sectionData) => {
    try {
        const response = await axiosInstance.put(`/homepage-sections/${id}`, sectionData);
        return response.data;
    } catch (error) {
        console.error("Error updating homepage section:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Delete section
export const deleteHomepageSection = async (id) => {
    try {
        const response = await axiosInstance.delete(`/homepage-sections/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting homepage section:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Update section status (enable/disable)
export const updateHomepageSectionStatus = async (id, isActive) => {
    try {
        const response = await axiosInstance.patch(`/homepage-sections/${id}/status`, { isActive });
        return response.data;
    } catch (error) {
        console.error("Error updating homepage section status:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Search categories by name
export const searchCategories = async (categoryName) => {
    try {
        const response = await axiosInstance.get(`/categories/all-category?categoryName=${encodeURIComponent(categoryName)}&limit=20`);
        return response.data;
    } catch (error) {
        console.error("Error searching categories:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            data: []
        };
    }
};

// Search offers by name
export const searchOffers = async (offerName) => {
    try {
        const response = await axiosInstance.get(`/offer/search-by-name?name=${encodeURIComponent(offerName)}`);
        return response.data;
    } catch (error) {
        console.error("Error searching offers:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            result: []
        };
    }
};
