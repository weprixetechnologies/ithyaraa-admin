import axiosInstance from "../axiosInstance";

export const listSizeCharts = async () => {
  const res = await axiosInstance.get("/size-charts");
  return res.data;
};

export const createSizeChart = async ({ chartName, imgUrl }) => {
  const res = await axiosInstance.post("/size-charts", { chartName, imgUrl });
  return res.data;
};

export const deleteSizeChart = async (id, nullify = false) => {
  const res = await axiosInstance.delete(`/size-charts/${id}`, {
    params: { nullify: nullify ? 'true' : 'false' }
  });
  return res.data;
};

