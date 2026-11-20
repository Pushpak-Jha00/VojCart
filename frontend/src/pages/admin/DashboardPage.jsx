import { useQuery } from "@tanstack/react-query";
import {
  Package,
  CheckCircle2,
  CircleAlert,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  Utensils,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { Link } from "react-router-dom";

import api from "../../api/axios";

const fetchDashboard = async () => {
  const response = await api.get("/dashboard/overview");

  const payload = response.data?.data ?? response.data;

  return {
    ...(payload?.overview ?? {}),
    foodDistribution: payload?.foodDistribution ?? {},
    recentlyAddedProducts: payload?.recentlyAddedProducts ?? [],
  };
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const StatCard = ({ title, value, icon: Icon, description }) => (
  <div className="rounded-2xl border border-[#E9E2D8] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#352719]/[0.04]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-[#898074]">{title}</p>
        <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#28241F]">
          {value ?? 0}
        </h3>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9EAD9] text-[#C77A2F]">
        <Icon size={19} />
      </div>
    </div>

    <p className="mt-4 text-xs text-[#9B9185]">{description}</p>
  </div>
);

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-2xl bg-[#EAE4DA]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-2xl bg-[#EAE4DA]" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-[#EAE4DA]" />
    </div>
  );
}

function getFoodDistribution(distribution) {
  if (Array.isArray(distribution)) {
    return distribution.map((item) => ({
      name: item.name ?? item.foodType ?? "Other",
      count: Number(item.count ?? item.total ?? 0),
    }));
  }

  if (distribution && typeof distribution === "object") {
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.replace("-", " "),
      count: Number(
        typeof value === "object" ? (value.count ?? value.total ?? 0) : value,
      ),
    }));
  }

  return [];
}

export default function DashboardPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboard,
    staleTime: 30000,
  });

  if (isPending) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
        <CircleAlert className="mx-auto text-red-500" size={30} />
        <h2 className="mt-4 font-semibold text-[#29251F]">
          Could not load dashboard
        </h2>
        <p className="mt-2 text-sm text-[#8A8075]">
          {error?.response?.data?.message ||
            error?.message ||
            "Something went wrong while loading dashboard data."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#29251F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#40372D]"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    );
  }

  const totalProducts = data?.totalProducts ?? 0;
  const availableProducts = data?.availableProducts ?? 0;
  const unavailableProducts = data?.unavailableProducts ?? 0;
  const deletedProducts = data?.deletedProducts ?? 0;
  const totalCategories = data?.totalCategories ?? 0;
  const activeCategories = data?.activeCategories ?? 0;

  const recentProducts = data?.recentlyAddedProducts ?? [];
  const foodDistribution = getFoodDistribution(data?.foodDistribution);

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C17A35]">
            Store overview
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#29251F] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#8D8377]">
            A quick look at your VojCart menu and products.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#E5DDD2] bg-white px-4 py-2.5 text-sm font-semibold text-[#62594E] transition hover:border-[#D6A16B] hover:text-[#B86E2B] disabled:opacity-60"
        >
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </section>

      {/* Main statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total products"
          value={totalProducts}
          icon={Package}
          description="Products in your menu"
        />
        <StatCard
          title="Available"
          value={availableProducts}
          icon={CheckCircle2}
          description="Products customers can order at the counter"
        />
        <StatCard
          title="Unavailable"
          value={unavailableProducts}
          icon={CircleAlert}
          description="Temporarily unavailable products"
        />
        <StatCard
          title="Recycle bin"
          value={deletedProducts}
          icon={Trash2}
          description="Soft-deleted products"
        />
      </section>

      {/* Category summary */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E9E2D8] bg-[#29251F] p-5 text-white sm:flex-row sm:items-center sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E99A48]/15 text-[#E99A48]">
            <Utensils size={21} />
          </div>
          <div>
            <p className="text-sm font-semibold">Menu categories</p>
            <p className="mt-1 text-xs text-[#A69B8E]">
              Organise products into clear menu sections
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          <div>
            <p className="text-2xl font-bold">{totalCategories}</p>
            <p className="mt-1 text-xs text-[#A69B8E]">Total categories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#E99A48]">
              {activeCategories}
            </p>
            <p className="mt-1 text-xs text-[#A69B8E]">Active categories</p>
          </div>
        </div>
      </section>

      {/* Chart and recent products */}
      <section className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        {/* Food type chart */}
        <div className="rounded-2xl border border-[#E9E2D8] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-[#29251F]">Product distribution</h2>
              <p className="mt-1 text-xs text-[#978D81]">
                Products grouped by food type
              </p>
            </div>
            <div className="rounded-lg bg-[#F9EAD9] p-2 text-[#C77A2F]">
              <Utensils size={17} />
            </div>
          </div>

          {foodDistribution.length > 0 ? (
            <div className="mt-7 h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={foodDistribution}
                  margin={{ top: 5, right: 10, left: -22, bottom: 5 }}
                >
                  <CartesianGrid
                    stroke="#EEE9E1"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#82796E", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A49A8E", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#F9F5EF" }}
                    contentStyle={{
                      border: "1px solid #E9E2D8",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Products"
                    fill="#E99A48"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[250px] flex-col items-center justify-center text-center">
              <Package size={28} className="text-[#C7BEB2]" />
              <p className="mt-3 text-sm font-medium text-[#655D53]">
                No distribution data yet
              </p>
              <p className="mt-1 text-xs text-[#A49A8E]">
                Add products to see the chart.
              </p>
            </div>
          )}
        </div>

        {/* Recent products */}
        <div className="overflow-hidden rounded-2xl border border-[#E9E2D8] bg-white">
          <div className="flex items-center justify-between border-b border-[#F0EBE4] px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold text-[#29251F]">Recently added</h2>
              <p className="mt-1 text-xs text-[#978D81]">
                Your latest menu additions
              </p>
            </div>

            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#BD752F] hover:text-[#92521E]"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-[#F1ECE5]">
            {recentProducts.length > 0 ? (
              recentProducts.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 px-5 py-3.5 sm:px-6"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#F3EEE7]">
                    {product.image?.url ? (
                      <img
                        src={product.image.url}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#B9AA98]">
                        <Package size={19} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#373129]">
                      {product.name}
                    </p>
                    <p className="mt-1 truncate text-xs capitalize text-[#9A9084]">
                      {product.category?.name ||
                        product.foodType ||
                        "Uncategorised"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#373129]">
                      {formatPrice(product.price)}
                    </p>
                    <span
                      className={`mt-1 inline-block text-[10px] font-semibold ${
                        product.isAvailable
                          ? "text-[#A66A2E]"
                          : "text-[#91877B]"
                      }`}
                    >
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <Package size={28} className="text-[#C7BEB2]" />
                <p className="mt-3 text-sm font-semibold text-[#655D53]">
                  No products added yet
                </p>
                <p className="mt-1 text-xs text-[#A49A8E]">
                  Your recent products will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
