import axiosInstance from "../axiosInstance";

export const getNewsletterSubscribers = async ({ page = 1, limit = 20, status, search } = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const url = `/admin/newsletter/subscribers?${params.toString()}`;
  const res = await axiosInstance.get(url);
  return res.data;
};

export const exportSubscribersCsv = ({ status, search } = {}) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (search) params.append("search", search);
  params.append("export", "csv");

  const base = axiosInstance.defaults.baseURL?.replace(/\/+$/, "") || "";
  const url = `${base}/admin/newsletter/subscribers?${params.toString()}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

export const getAdminNewsletters = async ({ page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  const url = `/admin/newsletters?${params.toString()}`;
  const res = await axiosInstance.get(url);
  return res.data;
};

export const createNewsletter = async ({ title, content_html, content_text, status }) => {
  const res = await axiosInstance.post("/admin/newsletters", {
    title,
    content_html,
    content_text,
    status,
  });
  return res.data;
};

export const sendNewsletter = async ({ id, retryFailed = false } = {}) => {
  const url = `/admin/newsletters/${id}/send${retryFailed ? "?retryFailed=true" : ""}`;
  const res = await axiosInstance.post(url);
  return res.data;
};

export const getNewsletterStats = async (id) => {
  const res = await axiosInstance.get(`/admin/newsletters/${id}/stats`);
  return res.data;
};

