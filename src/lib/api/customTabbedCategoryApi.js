import api from '../axiosInstance';

// GET /api/admin/custom-tabbed-categories
export const getCustomTabbedCategories = async () => {
    const response = await api.get('/admin/custom-tabbed-categories');
    return response.data;
};

// POST /api/admin/custom-tabbed-categories
export const upsertCustomTabbedCategory = async (data) => {
    const response = await api.post('/admin/custom-tabbed-categories', data);
    return response.data;
};

// DELETE /api/admin/custom-tabbed-categories/:id
export const deleteCustomTabbedCategory = async (id) => {
    const response = await api.delete(`/admin/custom-tabbed-categories/${id}`);
    return response.data;
};

// Public endpoint used by app (duplicated per request)
// GET /api/products/shop/customtabbed
export const getPublicCustomTabbedCategories = async () => {
    const response = await api.get('/products/shop/customtabbed');
    return response.data;
};
