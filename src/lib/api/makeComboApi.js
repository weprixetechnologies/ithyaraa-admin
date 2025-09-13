import axiosInstance from "../axiosInstance";

export const getMakeComboDetail = async (productID) => {
    const response = await axiosInstance.get(`/make-combo/detail/${productID}`);
    return response.data; // adjust if your response structure differs
};