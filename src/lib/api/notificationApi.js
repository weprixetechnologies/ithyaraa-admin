import axiosInstance from "../axiosInstance";

export const createNotification = async ({ title, content_html, image_url, type, brandIds }) => {
  const res = await axiosInstance.post("/admin/notifications", {
    title,
    content_html,
    image_url,
    type,
    brandIds,
  });
  return res.data;
};

export const getAdminNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  const res = await axiosInstance.get(`/admin/notifications?${params.toString()}`);
  return res.data;
};

export const getNotificationDeliveries = async (id) => {
  const res = await axiosInstance.get(`/admin/notifications/${id}/deliveries`);
  return res.data;
};

export const resendNotificationEmail = async (id, { brandIds } = {}) => {
  const res = await axiosInstance.post(`/admin/notifications/${id}/resend-email`, {
    brandIds: brandIds || undefined
  });
  return res.data;
};

