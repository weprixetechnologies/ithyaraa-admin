import axiosInstance from '../axiosInstance';

// Get all presale bookings with pagination and filters
export const getAllPresaleBookings = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/admin/presale-bookings/all', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching presale bookings:', error);
        throw error;
    }
};

// Get presale booking details by ID
export const getPresaleBookingDetails = async (preBookingID) => {
    try {
        const response = await axiosInstance.get(`/admin/presale-bookings/${preBookingID}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching presale booking details:', error);
        throw error;
    }
};

// Update presale booking order status
export const updatePresaleBookingStatus = async (preBookingID, orderStatus) => {
    try {
        const response = await axiosInstance.put(`/admin/presale-bookings/update-status/${preBookingID}`, {
            orderStatus
        });
        return response.data;
    } catch (error) {
        console.error('Error updating presale booking status:', error);
        throw error;
    }
};

// Update presale booking payment status
export const updatePresaleBookingPaymentStatus = async (preBookingID, paymentStatus) => {
    try {
        const response = await axiosInstance.put(`/admin/presale-bookings/update-payment-status/${preBookingID}`, {
            paymentStatus
        });
        return response.data;
    } catch (error) {
        console.error('Error updating presale booking payment status:', error);
        throw error;
    }
};

// Update presale booking tracking information
export const updatePresaleBookingTracking = async (preBookingID, trackingCode, deliveryCompany) => {
    try {
        const response = await axiosInstance.put(`/admin/presale-bookings/update-tracking/${preBookingID}`, {
            trackingCode,
            deliveryCompany
        });
        return response.data;
    } catch (error) {
        console.error('Error updating presale booking tracking:', error);
        throw error;
    }
};

// Re-check payment status with PhonePe API
export const recheckPresalePaymentStatus = async (preBookingID) => {
    try {
        const response = await axiosInstance.get(`/phonepe/presale/${preBookingID}/status`);
        return response.data;
    } catch (error) {
        console.error('Error re-checking presale payment status:', error);
        throw error;
    }
};

// Bulk re-check payment status for multiple presale bookings
export const bulkRecheckPresalePaymentStatus = async (preBookingIDs) => {
    try {
        const response = await axiosInstance.post('/admin/presale-bookings/bulk-recheck-payment-status', {
            preBookingIDs
        });
        return response.data;
    } catch (error) {
        console.error('Error bulk re-checking presale payment status:', error);
        throw error;
    }
};

