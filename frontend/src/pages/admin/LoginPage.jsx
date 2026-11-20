import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Store,
  ShieldCheck,
  Utensils,
  Loader2,
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

      // Step 1: Login and receive authentication cookie.
      await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      // Step 2: Verify that the browser sends the cookie.
      const meResponse = await api.get("/auth/me");

      if (!meResponse.data?.admin) {
        throw new Error("Unable to verify admin session.");
      }

      // Step 3: Store the verified admin session in React Query.
      queryClient.setQueryData(["admin", "me"], meResponse.data.admin);

      toast.success("Welcome back! Login successful.");

      // Step 4: Navigate only after session verification.
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
    <main className="min-h-screen bg-[#F4F0E9] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1250px] overflow-hidden rounded-[26px] bg-white shadow-[0_25px_90px_rgba(40,30,20,0.12)] sm:min-h-[calc(100vh-40px)] lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT BRAND PANEL */}
        <section className="relative hidden overflow-hidden bg-[#25211D] text-[#F8F3EB] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-36 -top-36 h-[420px] w-[420px] rounded-full border border-[#E99A48]/15" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-[280px] w-[280px] rounded-full border border-[#E99A48]/20" />
          <div className="pointer-events-none absolute -bottom-40 -left-36 h-[420px] w-[420px] rounded-full bg-[#E99A48]/[0.07] blur-3xl" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E99A48] text-[#25211D] shadow-lg shadow-black/20">
              <Store size={23} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">VojCart</h1>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.23em] text-[#A89D90]">
                Digital Menu Platform
              </p>
            </div>
          </div>

          {/* Main message */}
          <div className="relative z-10 max-w-[460px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E99A48]/25 bg-[#E99A48]/10 px-3.5 py-2">
              <span className="h-2 w-2 rounded-full bg-[#E99A48]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#E9B47F]">
                Admin workspace
              </span>
            </div>

            <h2 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-[48px]">
              Your menu.
              <br />
              Your <span className="text-[#E99A48]">control.</span>
            </h2>

            <p className="mt-6 max-w-[380px] text-sm leading-7 text-[#B8AEA2]">
              Manage your food menu, organise categories, update availability
              and keep your digital storefront ready for customers.
            </p>

            {/* Decorative menu preview */}
            <div className="mt-12 max-w-[390px] rounded-2xl border border-white/[0.09] bg-white/[0.045] p-5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <Utensils size={16} className="text-[#E99A48]" />
                  <span className="text-xs font-semibold text-[#F2E8DB]">
                    Your digital menu
                  </span>
                </div>
                <span className="rounded-full bg-[#E99A48]/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#E9B47F]">
                  Live menu
                </span>
              </div>

              <div className="space-y-4 pt-4">
                {[
                  {
                    name: "Classic Burger",
                    description: "Fresh and delicious",
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
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E99A48]/15 text-sm font-bold text-[#E9B47F]">
                      {item.symbol}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#F4EDE3]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[10px] text-[#A89D90]">
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
          <div className="relative z-10 flex items-center justify-between border-t border-white/[0.08] pt-6">
            <p className="text-xs text-[#93887B]">
              © {new Date().getFullYear()} VojCart
            </p>
            <div className="flex items-center gap-2 text-xs text-[#A89D90]">
              <ShieldCheck size={15} className="text-[#E99A48]" />
              Secure admin access
            </div>
          </div>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-[390px]"
          >
            {/* Mobile brand */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E99A48] text-[#25211D]">
                <Store size={21} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#29251F]">VojCart</h1>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#968B7F]">
                  Digital Menu Platform
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-9">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9EAD9] text-[#BD752F]">
                <LockKeyhole size={22} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BD752F]">
                Administrator access
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#29251F]">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#91877B]">
                Sign in to manage your store and digital menu.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-[#51483E]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49A8E]"
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
                    className="w-full rounded-xl border border-[#E7E0D6] bg-[#FAF8F4] py-3.5 pl-11 pr-4 text-sm text-[#302B25] outline-none transition placeholder:text-[#B5AA9E] focus:border-[#D69A5E] focus:bg-white focus:ring-4 focus:ring-[#E99A48]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-[#51483E]"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49A8E]"
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
                    className="w-full rounded-xl border border-[#E7E0D6] bg-[#FAF8F4] py-3.5 pl-11 pr-12 text-sm text-[#302B25] outline-none transition placeholder:text-[#B5AA9E] focus:border-[#D69A5E] focus:bg-white focus:ring-4 focus:ring-[#E99A48]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A49A8E] transition hover:text-[#BD752F]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#29251F] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#29251F]/10 transition hover:bg-[#44392E] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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

            {/* Security note */}
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#EEE8E0] bg-[#FAF8F4] p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#BD752F]"
              />
              <div>
                <p className="text-xs font-bold text-[#51483E]">
                  Protected administrator area
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#968B7F]">
                  This login is only for authorised store administrators.
                  Customer registration is not available here.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-[11px] text-[#A49A8E] lg:hidden">
              © {new Date().getFullYear()} VojCart. All rights reserved.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
