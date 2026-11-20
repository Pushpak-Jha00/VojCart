import api from "./axios";

export const getMenuQR = async () => {
  const { data } = await api.get("/menu/qr");
  return data;
};
