import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Layers3,
  LoaderCircle,
  X,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getAdminCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from "../../api/categories.api";

const emptyForm = {
  name: "",
  description: "",
  sortOrder: 0,
};

const CategoriesPage = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
    staleTime: 30000,
    retry: 1,
  });

  const categories = data?.categories || [];

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categories
      .filter((category) => {
        const matchesSearch =
          !normalizedSearch ||
          category.name?.toLowerCase().includes(normalizedSearch) ||
          category.description?.toLowerCase().includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && category.isActive) ||
          (statusFilter === "inactive" && !category.isActive);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories, search, statusFilter]);

  const activeCount = categories.filter((item) => item.isActive).length;
  const inactiveCount = categories.length - activeCount;

  const invalidateCategories = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin-categories"],
    });

    queryClient.invalidateQueries({
      queryKey: ["public-menu"],
    });

    queryClient.invalidateQueries({
      queryKey: ["dashboard-overview"],
    });
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidateCategories();
      toast.success("Category created successfully");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      invalidateCategories();
      toast.success("Category updated successfully");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to update category");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleCategoryStatus,
    onSuccess: () => {
      invalidateCategories();
      toast.success("Category status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidateCategories();
      toast.success("Category deleted successfully");
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Unable to delete category. Check whether products are using it.",
      );
    },
  });

  function closeModal() {
    setModalOpen(false);
    setEditingCategory(null);
  }

  function openCreateModal() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  function handleToggle(category) {
    const action = category.isActive ? "disable" : "enable";

    if (
      !window.confirm(`Are you sure you want to ${action} "${category.name}"?`)
    ) {
      return;
    }

    toggleMutation.mutate(category._id);
  }

  function handleDelete(category) {
    if (
      !window.confirm(
        `Permanently delete "${category.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    deleteMutation.mutate(category._id);
  }

  function handleSubmit(formData) {
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory._id,
        categoryData: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle size={30} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle size={30} className="mx-auto mb-3 text-red-500" />

        <h2 className="font-semibold text-neutral-900">
          Unable to load categories
        </h2>

        <p className="mt-2 text-sm text-neutral-600">
          {error?.response?.data?.message ||
            "Please check your connection and try again."}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <Layers3 size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">
              Menu Organization
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Categories
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Organize your menu and control which categories customers can see.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-400"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryItem
          label="Total Categories"
          value={categories.length}
          icon={Layers3}
        />

        <SummaryItem
          label="Active Categories"
          value={activeCount}
          icon={FolderOpen}
        />

        <SummaryItem
          label="Inactive Categories"
          value={inactiveCount}
          icon={Power}
        />
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold capitalize transition ${
                  statusFilter === status
                    ? "bg-neutral-900 text-white"
                    : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {status}
              </button>
            ))}

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border border-neutral-200 p-2.5 text-neutral-600 hover:bg-neutral-50"
              title="Refresh categories"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Category list */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-5 py-16 text-center">
          <FolderOpen size={35} className="mx-auto text-neutral-300" />

          <h3 className="mt-4 font-semibold text-neutral-900">
            No categories found
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            {search || statusFilter !== "all"
              ? "Try changing your search or filter."
              : "Create your first category to organize your menu."}
          </p>

          {!search && statusFilter === "all" && (
            <button
              onClick={openCreateModal}
              className="mt-5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-neutral-950"
            >
              Add your first category
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-neutral-900">All Categories</h2>
              <p className="mt-1 text-xs text-neutral-500">
                {filteredCategories.length} categories displayed
              </p>
            </div>

            <span className="hidden items-center gap-2 text-xs text-neutral-400 sm:flex">
              <ArrowUpDown size={14} />
              Sorted by display order
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.2) }}
                className="flex flex-col gap-4 px-5 py-5 transition hover:bg-neutral-50/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Layers3 size={21} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold text-neutral-900">
                        {category.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          category.isActive
                            ? "bg-amber-50 text-amber-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                      {category.description || "No description added"}
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Display order: {category.sortOrder ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    onClick={() => openEditModal(category)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 sm:flex-none"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggle(category)}
                    disabled={toggleMutation.isPending}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 sm:flex-none"
                  >
                    <Power size={14} />
                    {category.isActive ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={() => handleDelete(category)}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Category modal */}
      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          saving={isSaving}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

const SummaryItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-neutral-500">{label}</p>

      <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
        <Icon size={18} />
      </div>
    </div>

    <p className="mt-3 text-2xl font-bold tabular-nums text-neutral-900">
      {value}
    </p>
  </div>
);

const CategoryModal = ({ category, saving, onClose, onSubmit }) => {
  const [form, setForm] = useState(() => ({
    name: category?.name || emptyForm.name,
    description: category?.description || emptyForm.description,
    sortOrder: category?.sortOrder ?? emptyForm.sortOrder,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "sortOrder" ? value : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = form.name.trim();

    if (!name) {
      toast.error("Please enter a category name");
      return;
    }

    onSubmit({
      name,
      description: form.description.trim(),
      sortOrder: Number(form.sortOrder) || 0,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {category ? "Edit Category" : "Create Category"}
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Add details to organize your food menu.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700">
              Category Name <span className="text-red-500">*</span>
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Burgers"
              maxLength={60}
              required
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write a short category description..."
              rows={3}
              maxLength={250}
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
            />

            <p className="mt-1 text-right text-xs text-neutral-400">
              {form.description.length}/250
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700">
              Display Order
            </label>

            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
              min="0"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500"
            />

            <p className="mt-1 text-xs text-neutral-400">
              Lower numbers appear first in the menu.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-400 disabled:opacity-60"
            >
              {saving && <LoaderCircle size={16} className="animate-spin" />}

              {category ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CategoriesPage;
