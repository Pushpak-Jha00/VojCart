import api from "./axios";

export const getMenu = async (params = {}) => {
  const { data } = await api.get("/menu", {
    params,
  });

  return data;
};
