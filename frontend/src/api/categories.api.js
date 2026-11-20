import api from "./axios";

export const getAdminCategories = async () => {
  const { data } = await api.get("/categories/admin/all");
  return data;
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post("/categories", categoryData);
  return data;
};

export const updateCategory = async ({ id, categoryData }) => {
  const { data } = await api.put(`/categories/${id}`, categoryData);
  return data;
};

export const toggleCategoryStatus = async (id) => {
  const { data } = await api.patch(`/categories/${id}/status`);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

export const getPublicCategories = async () => {
  const { data } = await api.get("/categories");
  return data;
};
