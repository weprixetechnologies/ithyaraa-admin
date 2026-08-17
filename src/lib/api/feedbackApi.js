import axiosInstance from "../axiosInstance";

export const getDeliveryFeedback = async () => {
    const response = await axiosInstance.get("/delivery-experience/admin/list");
    return response.data;
};
