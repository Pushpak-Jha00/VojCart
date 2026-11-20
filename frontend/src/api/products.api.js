import api from "./axios";

export const getAdminProducts = async (params = {}) => {
  const { data } = await api.get("/products/admin/all", {
    params,
  });

  return data;
};

export const getAdminProductById = async (id) => {
  const { data } = await api.get(`/products/admin/${id}`);
  return data.product;
};


export const createProduct = async (formData) => {
  const { data } = await api.post("/products", formData);
  return data;
};

export const updateProduct = async ({ id, formData }) => {
  const { data } = await api.put(`/products/${id}`, formData);
  return data;
};


export const toggleProductAvailability = async (id) => {
  const { data } = await api.patch(`/products/${id}/availability`);

  return data;
};

export const softDeleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const restoreProduct = async (id) => {
  const { data } = await api.patch(`/products/${id}/restore`);
  return data;
};

export const permanentlyDeleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}/permanent`);
  return data;
};
