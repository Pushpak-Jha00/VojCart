import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
  Utensils,
  Loader2,
  Sparkles,
} from "lucide-react";

import api from "../../api/axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      // Verify the authenticated session using the cookie.
      const meResponse = await api.get("/auth/me");

      if (!meResponse.data?.admin) {
        throw new Error("Unable to verify admin session.");
      }

      queryClient.setQueryData(["admin", "me"], meResponse.data.admin);

      toast.success("Welcome back! Login successful.");

      navigate("/admin", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to sign in. Please check your credentials.";

      queryClient.removeQueries({
        queryKey: ["admin", "me"],
      });

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F3EEE5] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1280px] overflow-hidden rounded-[28px] border border-[#E8DED0] bg-white shadow-[0_25px_80px_rgba(43,34,24,0.10)] sm:min-h-[calc(100vh-40px)] lg:grid-cols-[1.08fr_0.92fr]">
        {/* LEFT BRAND SECTION */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#29231E] p-10 text-[#F8F1E7] lg:flex xl:p-14">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full border border-[#E99A48]/15" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-[320px] w-[320px] rounded-full border border-[#E99A48]/20" />
          <div className="pointer-events-none absolute -bottom-48 -left-40 h-[480px] w-[480px] rounded-full bg-[#E99A48]/10 blur-3xl" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E99A48] text-[#29231E] shadow-lg">
              <Store size={23} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">VojCart</h1>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#A99C8C]">
                Street food. Simplified.
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 my-12 max-w-[490px]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#E99A48]/25 bg-[#E99A48]/10 px-4 py-2">
              <Sparkles size={13} className="text-[#E99A48]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#E9B47F]">
                Admin workspace
              </span>
            </div>

            <h2 className="text-5xl font-bold leading-[1.13] tracking-tight xl:text-[58px]">
              Good food.
              <br />
              <span className="text-[#E99A48]">Great business.</span>
            </h2>

            <p className="mt-6 max-w-[390px] text-sm leading-7 text-[#B9AEA1]">
              Your food van, your menu, your control. Manage products, organise
              categories and keep your digital storefront ready for every
              customer.
            </p>

            {/* Menu preview */}
            <div className="mt-12 max-w-[390px] rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Utensils size={16} className="text-[#E99A48]" />
                  <span className="text-xs font-semibold text-[#F4EBDD]">
                    Today's menu
                  </span>
                </div>

                <span className="rounded-full bg-[#E99A48]/15 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#E9B47F]">
                  VojCart
                </span>
              </div>

              <div className="space-y-4 pt-5">
                {[
                  {
                    name: "Classic Burger",
                    description: "Freshly prepared favourite",
                    price: "₹149",
                    symbol: "B",
                  },
                  {
                    name: "Crispy Fries",
                    description: "Golden and crunchy",
                    price: "₹89",
                    symbol: "F",
                  },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E99A48]/15 text-sm font-bold text-[#E9B47F]">
                      {item.symbol}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#F4EBDD]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[10px] text-[#A99C8C]">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-[#E9B47F]">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom information */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
            <p className="text-[11px] text-[#93877A]">
              © {new Date().getFullYear()} VojCart
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[#B9AEA1]">
              <ShieldCheck size={15} className="text-[#E99A48]" />
              Secure administrator access
            </div>
          </div>
        </section>

        {/* RIGHT LOGIN SECTION */}
        <section className="relative flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-[410px]"
          >
            {/* Top navigation */}
            <div className="mb-12 flex items-center justify-between gap-3">
              {/* Mobile brand */}
              <Link to="/menu" className="flex items-center gap-2.5 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E99A48] text-[#29231E]">
                  <Store size={20} />
                </div>

                <div>
                  <h1 className="text-lg font-extrabold text-[#29231E]">
                    VojCart
                  </h1>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A09689]">
                    Digital Menu
                  </p>
                </div>
              </Link>

              {/* Customer menu button */}
              <Link
                to="/menu"
                className="group ml-auto inline-flex items-center gap-2 rounded-full border border-[#E9DED0] bg-[#FBF8F3] px-4 py-2.5 text-[11px] font-bold text-[#66594C] transition hover:border-[#D69A5E] hover:bg-[#F8EBDD] hover:text-[#A55E26]"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-1"
                />
                Back to Menu
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-9">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8EBDD] text-[#B86C30]">
                <LockKeyhole size={22} />
              </div>

              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B86C30]">
                Administrator access
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#29231E] sm:text-[34px]">
                Welcome back.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#92877B]">
                Sign in to manage your store and digital menu.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-[#51473D]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A69A8D]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-[#E7DED2] bg-[#FBF9F5] py-3.5 pl-11 pr-4 text-sm text-[#302A23] outline-none transition placeholder:text-[#B7ADA2] focus:border-[#D69A5E] focus:bg-white focus:ring-4 focus:ring-[#E99A48]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-bold text-[#51473D]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A69A8D]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#E7DED2] bg-[#FBF9F5] py-3.5 pl-11 pr-12 text-sm text-[#302A23] outline-none transition placeholder:text-[#B7ADA2] focus:border-[#D69A5E] focus:bg-white focus:ring-4 focus:ring-[#E99A48]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A69A8D] transition hover:text-[#B86C30]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#29231E] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#29231E]/10 transition hover:bg-[#44392E] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to dashboard
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Security information */}
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#EEE5DA] bg-[#FBF9F5] p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#B86C30]"
              />

              <div>
                <p className="text-xs font-bold text-[#51473D]">
                  Protected administrator area
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#968A7D]">
                  This area is only for authorised store administrators.
                  Customers can explore the menu without signing in.
                </p>
              </div>
            </div>

            {/* Bottom navigation */}
            <div className="mt-8 border-t border-[#EEE7DE] pt-5 text-center">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#A16A3D] transition hover:text-[#75431F]"
              >
                <Utensils size={14} />
                Continue exploring the customer menu
                <ArrowRight size={13} />
              </Link>

              <p className="mt-5 text-[10px] text-[#A69B8F]">
                © {new Date().getFullYear()} VojCart. All rights reserved.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
