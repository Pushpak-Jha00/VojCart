import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  RotateCcw,
  Power,
  X,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Utensils,
} from "lucide-react";

import {
  getAdminProducts,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  softDeleteProduct,
  restoreProduct,
  permanentlyDeleteProduct,
} from "../../api/products.api";

import { getAdminCategories } from "../../api/categories.api";
import { socket } from "../../socket/socket.js";

const LIMIT = 12;

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",

    currency: "INR",

    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

function StatusBadge({ available, deleted }) {
  if (deleted) {
    return (
      <span className="rounded-full bg-[#EEE9E2] px-3 py-1 text-[11px] font-semibold text-[#766D62]">
        Deleted
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
        available
          ? "bg-[#F9EAD9] text-[#A86528]"
          : "bg-[#F0EEEB] text-[#81796F]"
      }`}
    >
      {available ? "Available" : "Unavailable"}
    </span>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-2xl bg-[#EAE4DA]"
        />
      ))}
    </div>
  );
}

function ProductFormModal({ product, categories, onClose, onSave, saving }) {
  const isEditing = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name || "",

    description: product?.description || "",

    price: product?.price ?? "",

    category: product?.category?._id || product?.category || "",

    foodType: product?.foodType || "veg",

    featured: product?.featured || false,

    sortOrder: product?.sortOrder ?? 0,
  });

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(product?.image?.url || "");

  useEffect(() => {
    if (!image) return;

    const objectUrl = URL.createObjectURL(image);

    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isEditing && !image) {
      toast.error("Please select a product image");

      return;
    }

    if (!form.category) {
      toast.error("Please select a category");

      return;
    }

    const formData = new FormData();

    formData.append("name", form.name.trim());

    formData.append("description", form.description.trim());

    formData.append("price", String(form.price));

    formData.append("category", form.category);

    formData.append("foodType", form.foodType);

    formData.append("featured", String(form.featured));

    formData.append("sortOrder", String(form.sortOrder));

    if (image instanceof File) {
      formData.append("image", image);
    }

    console.log("Selected image:", image);

    console.log("FormData image:", formData.get("image"));

    onSave(formData);
  };

  const activeCategories = categories.filter((category) => category.isActive);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-6">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#FAF8F4] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EAE3D9] bg-[#FAF8F4] px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BD752F]">
              Product management
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#29251F]">
              {isEditing ? "Edit product" : "Add new product"}
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            aria-label="Close form"
            className="rounded-lg border border-[#E7E0D6] p-2 text-[#6E655A] hover:bg-white"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          {/* Image upload */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#494137]">
              Product image {!isEditing && "*"}
            </label>

            <label className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#D8CDBF] bg-white transition hover:border-[#D69A5E]">
              {preview ? (
                <div className="relative h-48 w-full">
                  <img
                    src={preview}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#29251F]">
                      Change image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10">
                  <div className="mb-3 rounded-xl bg-[#F9EAD9] p-3 text-[#BD752F]">
                    <ImagePlus size={24} />
                  </div>

                  <p className="text-sm font-semibold text-[#51483E]">
                    Upload product image
                  </p>

                  <p className="mt-1 text-xs text-[#A1988C]">
                    Select an image from your device
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setImage(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Product name */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#494137]">
              Product name *
            </label>

            <input
              required
              maxLength={100}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Classic Cheese Burger"
              className="w-full rounded-xl border border-[#E4DCD1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#D69A5E] focus:ring-2 focus:ring-[#E99A48]/10"
            />
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#494137]">
              Description *
            </label>

            <textarea
              required
              maxLength={500}
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the ingredients and taste..."
              className="w-full resize-none rounded-xl border border-[#E4DCD1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#D69A5E] focus:ring-2 focus:ring-[#E99A48]/10"
            />
          </div>

          {/* Price and sort order */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#494137]">
                Price (₹) *
              </label>

              <input
                required
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="149"
                className="w-full rounded-xl border border-[#E4DCD1] bg-white px-4 py-3 text-sm outline-none focus:border-[#D69A5E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#494137]">
                Display order
              </label>

              <input
                type="number"
                min="0"
                step="1"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E4DCD1] bg-white px-4 py-3 text-sm outline-none focus:border-[#D69A5E]"
              />
            </div>
          </div>

          {/* Category and food type */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#494137]">
                Category *
              </label>

              <select
                required
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E4DCD1] bg-white px-4 py-3 text-sm outline-none focus:border-[#D69A5E]"
              >
                <option value="">Select category</option>

                {activeCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {activeCategories.length === 0 && (
                <p className="mt-1.5 text-xs text-[#A66A2E]">
                  Create or activate a category first.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#494137]">
                Food type *
              </label>

              <select
                required
                name="foodType"
                value={form.foodType}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E4DCD1] bg-white px-4 py-3 text-sm outline-none focus:border-[#D69A5E]"
              >
                <option value="veg">Vegetarian</option>

                <option value="non-veg">Non-vegetarian</option>

                <option value="drink">Drink</option>
              </select>
            </div>
          </div>

          {/* Featured */}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E8E0D6] bg-white p-4">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="h-4 w-4 accent-[#C77A2F]"
            />

            <div>
              <p className="text-sm font-semibold text-[#494137]">
                Featured product
              </p>

              <p className="mt-0.5 text-xs text-[#9A9084]">
                Highlight this product in the customer menu.
              </p>
            </div>
          </label>

          {/* Actions */}

          <div className="flex flex-col-reverse gap-3 border-t border-[#EAE3D9] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#E2D9CD] px-5 py-3 text-sm font-semibold text-[#655B50] hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || activeCategories.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#29251F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#44392E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductCard({
  product,

  isDeleted,

  onEdit,

  onToggle,

  onDelete,

  onRestore,

  onPermanentDelete,

  busy,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E9E2D8] bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#352719]/[0.04]">
      <div className="flex gap-4 p-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F2EDE6]">
          {product.image?.url ? (
            <img
              src={product.image.url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#B8AC9E]">
              <Package size={25} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[#302B25]">
                {product.name}
              </h3>

              <p className="mt-1 text-xs capitalize text-[#958A7E]">
                {product.category?.name || "No category"} · {product.foodType}
              </p>
            </div>

            <StatusBadge available={product.isAvailable} deleted={isDeleted} />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-base font-bold text-[#B66C29]">
              {formatPrice(product.price)}
            </p>

            <div className="flex items-center gap-1.5">
              {!isDeleted ? (
                <>
                  <button
                    onClick={() => onEdit(product)}
                    disabled={busy}
                    title="Edit product"
                    className="rounded-lg border border-[#E9E2D8] p-2 text-[#756B5F] hover:border-[#D9A36C] hover:text-[#B66C29] disabled:opacity-50"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => onToggle(product)}
                    disabled={busy}
                    title={
                      product.isAvailable
                        ? "Make unavailable"
                        : "Make available"
                    }
                    className="rounded-lg border border-[#E9E2D8] p-2 text-[#756B5F] hover:border-[#D9A36C] hover:text-[#B66C29] disabled:opacity-50"
                  >
                    <Power size={15} />
                  </button>

                  <button
                    onClick={() => onDelete(product)}
                    disabled={busy}
                    title="Move to recycle bin"
                    className="rounded-lg border border-[#E9DAD4] p-2 text-[#A36B58] hover:bg-[#FBF0EC] disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onRestore(product)}
                    disabled={busy}
                    title="Restore product"
                    className="rounded-lg border border-[#E9E2D8] p-2 text-[#A66A2E] hover:bg-[#F9EAD9] disabled:opacity-50"
                  >
                    <RotateCcw size={15} />
                  </button>

                  <button
                    onClick={() => onPermanentDelete(product)}
                    disabled={busy}
                    title="Permanently delete"
                    className="rounded-lg border border-[#E9DAD4] p-2 text-[#A36B58] hover:bg-[#FBF0EC] disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();

  // Listen for availability changes made from another connected admin session.
  useEffect(() => {
    const handleAvailabilityUpdate = ({ productId, isAvailable }) => {
      if (!productId || typeof isAvailable !== "boolean") return;

      queryClient.setQueriesData(
        { queryKey: ["admin-products"] },
        (oldData) => {
          if (!oldData?.products) return oldData;

          return {
            ...oldData,
            products: oldData.products.map((product) =>
              product._id === productId ? { ...product, isAvailable } : product,
            ),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    };

    socket.on("product:availability-updated", handleAvailabilityUpdate);
    socket.connect();

    return () => {
      socket.off("product:availability-updated", handleAvailabilityUpdate);
      socket.disconnect();
    };
  }, [queryClient]);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [foodType, setFoodType] = useState("");

  const [status, setStatus] = useState("active");

  const [page, setPage] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());

      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const productQueryKey = useMemo(
    () => ["admin-products", { page, search, foodType, status }],

    [page, search, foodType, status],
  );

  const {
    data: productData,

    isPending,

    isError,

    error,

    isFetching,

    refetch,
  } = useQuery({
    queryKey: productQueryKey,

    queryFn: () =>
      getAdminProducts({
        page,

        limit: LIMIT,

        search: search || undefined,

        foodType: foodType || undefined,

        status,
      }),

    placeholderData: (previousData) => previousData,

    staleTime: 30000,
  });

  const {
    data: categoryData,

    isPending: categoriesLoading,

    isError: categoriesError,
  } = useQuery({
    queryKey: ["admin-categories"],

    queryFn: getAdminCategories,

    staleTime: 60000,
  });

  const products = productData?.products || [];

  const pagination = productData?.pagination || {};

  const categories = categoryData?.categories || [];

  const invalidateProducts = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin-products"],
    });

    queryClient.invalidateQueries({
      queryKey: ["dashboard", "overview"],
    });

    queryClient.invalidateQueries({
      queryKey: ["public-menu"],
    });
  };

  const createMutation = useMutation({
    mutationFn: createProduct,

    onSuccess: () => {
      toast.success("Product created successfully");

      setShowForm(false);

      setSelectedProduct(null);

      invalidateProducts();
    },

    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,

    onSuccess: () => {
      toast.success("Product updated successfully");

      setShowForm(false);

      setSelectedProduct(null);

      invalidateProducts();
    },

    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const availabilityMutation = useMutation({
    mutationFn: toggleProductAvailability,

    onSuccess: (data) => {
      toast.success(data?.message || "Availability updated");

      invalidateProducts();
    },

    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: softDeleteProduct,

    onSuccess: (data) => {
      toast.success(data?.message || "Product moved to recycle bin");

      invalidateProducts();
    },

    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,

    onSuccess: (data) => {
      toast.success(data?.message || "Product restored");

      invalidateProducts();
    },

    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: permanentlyDeleteProduct,

    onSuccess: (data) => {
      toast.success(data?.message || "Product permanently deleted");

      invalidateProducts();
    },

    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    availabilityMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending ||
    permanentDeleteMutation.isPending;

  const handleSave = (formData) => {
    if (selectedProduct) {
      updateMutation.mutate({
        id: selectedProduct._id,

        formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);

    setShowForm(true);
  };

  const handleDelete = (product) => {
    const confirmed = window.confirm(
      `Move "${product.name}" to the recycle bin?`,
    );

    if (confirmed) deleteMutation.mutate(product._id);
  };

  const handlePermanentDelete = (product) => {
    const confirmed = window.confirm(
      `Permanently delete "${product.name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      permanentDeleteMutation.mutate(product._id);
    }
  };

  const handleToggle = (product) => {
    availabilityMutation.mutate(product._id);
  };

  const handleRestore = (product) => {
    restoreMutation.mutate(product._id);
  };

  const changeStatus = (nextStatus) => {
    setStatus(nextStatus);

    setPage(1);
  };

  const changeFoodType = (nextType) => {
    setFoodType(nextType);

    setPage(1);
  };

  const totalPages = pagination.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Page heading */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#BD752F]">
            Menu management
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#29251F] sm:text-3xl">
            Products
          </h1>

          <p className="mt-2 text-sm text-[#8D8377]">
            Manage your menu items, prices and availability.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);

            setShowForm(true);
          }}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#29251F] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#44392E]"
        >
          <Plus size={17} />
          Add product
        </button>
      </section>

      {/* Filters */}

      <section className="rounded-2xl border border-[#E9E2D8] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49A8E]"
            />

            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-[#E9E2D8] bg-[#FAF8F4] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#D69A5E]"
            />
          </div>

          <select
            value={foodType}
            onChange={(event) => changeFoodType(event.target.value)}
            className="rounded-xl border border-[#E9E2D8] bg-[#FAF8F4] px-4 py-3 text-sm text-[#5E554A] outline-none focus:border-[#D69A5E]"
          >
            <option value="">All food types</option>

            <option value="veg">Vegetarian</option>

            <option value="non-veg">Non-vegetarian</option>

            <option value="drink">Drinks</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E9E2D8] px-4 py-3 text-sm font-semibold text-[#655B50] hover:bg-[#FAF8F4] disabled:opacity-50"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Active / recycle bin tabs */}

        <div className="mt-5 flex gap-2 border-b border-[#EEE8E0]">
          <button
            onClick={() => changeStatus("active")}
            className={`relative px-4 pb-3 text-sm font-semibold transition ${
              status === "active"
                ? "text-[#B66C29]"
                : "text-[#91877B] hover:text-[#51483E]"
            }`}
          >
            Active products
            {status === "active" && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#D58B43]" />
            )}
          </button>

          <button
            onClick={() => changeStatus("deleted")}
            className={`relative px-4 pb-3 text-sm font-semibold transition ${
              status === "deleted"
                ? "text-[#B66C29]"
                : "text-[#91877B] hover:text-[#51483E]"
            }`}
          >
            Recycle bin
            {status === "deleted" && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#D58B43]" />
            )}
          </button>
        </div>
      </section>

      {/* Product list heading */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#302B25]">
            {status === "deleted" ? "Deleted products" : "All products"}
          </h2>

          <p className="mt-1 text-xs text-[#9A9084]">
            {pagination.total ?? products.length} products found
          </p>
        </div>

        {isFetching && !isPending && (
          <span className="text-xs font-medium text-[#A66A2E]">
            Updating...
          </span>
        )}
      </div>

      {/* Error state */}

      {isError && !productData && (
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto text-red-500" size={30} />

          <h3 className="mt-3 font-semibold text-[#302B25]">
            Unable to load products
          </h3>

          <p className="mt-2 text-sm text-[#91877B]">
            {getErrorMessage(error)}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-5 rounded-xl bg-[#29251F] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}

      {isPending && <ProductSkeleton />}

      {/* Product grid */}

      {productData && (
        <>
          {products.length > 0 ? (
            <div
              className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isDeleted={status === "deleted"}
                  busy={isBusy}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E9E2D8] bg-white px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9EAD9] text-[#BD752F]">
                {status === "deleted" ? (
                  <Trash2 size={25} />
                ) : (
                  <Package size={25} />
                )}
              </div>

              <h3 className="mt-4 font-bold text-[#302B25]">
                {search
                  ? "No matching products"
                  : status === "deleted"
                    ? "Recycle bin is empty"
                    : "No products yet"}
              </h3>

              <p className="mt-2 text-sm text-[#958A7E]">
                {search
                  ? "Try another search term."
                  : status === "deleted"
                    ? "Deleted products will appear here."
                    : "Add your first product to start building the menu."}
              </p>

              {status === "active" && !search && (
                <button
                  onClick={() => {
                    setSelectedProduct(null);

                    setShowForm(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#29251F] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus size={16} />
                  Add product
                </button>
              )}
            </div>
          )}

          {/* Pagination */}

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-[#E9E2D8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#91877B]">
                Page {pagination.page || page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E9E2D8] px-3 py-2 text-xs font-semibold text-[#655B50] hover:bg-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <button
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E9E2D8] px-3 py-2 text-xs font-semibold text-[#655B50] hover:bg-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product form */}

      {showForm && (
        <ProductFormModal
          product={selectedProduct}
          categories={categories}
          onClose={() => {
            if (createMutation.isPending || updateMutation.isPending) return;

            setShowForm(false);

            setSelectedProduct(null);
          }}
          onSave={handleSave}
          saving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {categoriesError && (
        <p className="text-xs text-[#A66A2E]">
          Categories could not be loaded. Refresh the page before adding or
          editing a product.
        </p>
      )}

      {categoriesLoading && (
        <p className="text-xs text-[#91877B]">Loading product categories...</p>
      )}
    </div>
  );
}
