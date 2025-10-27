import axiosInstance from '../axiosInstance';

// Get all orders with pagination and filters
export const getAllOrders = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/order/admin/all', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

// Get order details by ID
export const getOrderDetails = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/order/admin/order-details/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};

// Update order status
export const updateOrderStatus = async (orderId, orderStatus) => {
    try {
        const response = await axiosInstance.put(`/order/admin/update-status/${orderId}`, {
            orderStatus
        });
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

// Update payment status
export const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
        const response = await axiosInstance.put(`/order/admin/update-payment-status/${orderId}`, {
            paymentStatus
        });
        return response.data;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
};

// Generate invoice data
export const generateInvoice = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/order/admin/generate-invoice/${orderId}?action=data`);
        return response.data;
    } catch (error) {
        console.error('Error generating invoice:', error);
        throw error;
    }
};

// Download invoice as PDF
export const downloadInvoice = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/order/admin/generate-invoice/${orderId}?action=download`, {
            responseType: 'blob'
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Error downloading invoice:', error);
        throw error;
    }
};

// Email invoice to customer
export const emailInvoice = async (orderId) => {
    try {
        const response = await axiosInstance.post(`/order/admin/email-invoice/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error emailing invoice:', error);
        throw error;
    }
};

// Update order items tracking
export const updateOrderItemsTracking = async (orderId, items) => {
    try {
        const response = await axiosInstance.put(`/order/admin/update-items-tracking/${orderId}`, { items });
        return response.data;
    } catch (error) {
        console.error('Error updating order items tracking:', error);
        throw error;
    }
};
