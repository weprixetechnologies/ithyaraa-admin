import axiosInstance from "../axiosInstance";

// Get paginated categories with optional filters
export const getPaginatedCategories = async ({ page = 1, limit = 10, filters = {} } = {}) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    for (const key in filters) {
        if (filters[key] !== undefined && filters[key] !== "") {
            params.append(key, filters[key]);
        }
    }

    const response = await axiosInstance.get(`categories/all-category?${params.toString()}`);
    return response.data;
};

// Get total count of categories with optional filters
export const getCategoryCount = async (filters = {}) => {
    const params = new URLSearchParams();

    for (const key in filters) {
        if (filters[key] !== undefined && filters[key] !== "") {
            params.append(key, filters[key]);
        }
    }

    const response = await axiosInstance.get(`count?dataType=categories&${params.toString()}`);
    return response.data.total || 0;
};

export const uploadCategory = async (categoryData) => {
    try {
        const response = await axiosInstance.post("/categories/upload-category", categoryData);
        return response.data;
    } catch (error) {
        console.error("Error uploading category:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

export const getCategoryByID = async (categoryID) => {
    try {
        const response = await axiosInstance.get(`/categories/${categoryID}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching category:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};


export const updateCategory = async (payload) => {
    try {
        const response = await axiosInstance.put("/categories/edit", payload);
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};
