import axiosInstance from "../axiosInstance";

export const getComboDetails = async (productID) => {
    const response = await axiosInstance.get(`/combo/detail/${productID}`);
    return response.data; // adjust if your response structure differs
};