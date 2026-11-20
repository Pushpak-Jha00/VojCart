import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Menu as MenuIcon,
  X,
  ArrowDown,
  Utensils,
  ChevronDown,
  RefreshCw,
  MapPin,
  Route,
  Clock3,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { getMenu } from "../../api/menu.api";
import { socket } from "../../socket/socket.js";
import ProductCard from "../../components/menu/ProductCard";
import ProductSkeleton from "../../components/menu/ProductSkeleton";

const foodFilters = [
  { label: "Everything", value: "" },
  { label: "Vegetarian", value: "veg" },
  { label: "Non-Veg", value: "non-veg" },
  { label: "Drinks", value: "drink" },
];

// Traveller-style camper van illustration

function CamperVanIllustration() {
  return (
    <svg
      viewBox="0 0 700 430"
      className="h-full w-full"
      role="img"
      aria-label="Illustration of the VojCart camper food van"
    >
      <defs>
        <linearGradient id="vanBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5E9D5" />

          <stop offset="100%" stopColor="#D9C5A6" />
        </linearGradient>

        <linearGradient id="vanWindow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5C6565" />

          <stop offset="100%" stopColor="#242D30" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}

      <ellipse
        cx="355"
        cy="365"
        rx="260"
        ry="25"
        fill="#100E0C"
        opacity=".25"
      />

      {/* Van body */}

      <path
        d="M92 126 Q92 82 139 82 H464 Q493 82 511 111 L589 213 Q604 232 604 257 V319 Q604 337 585 337 H104 Q82 337 82 315 V151 Q82 126 92 126Z"
        fill="url(#vanBody)"
        stroke="#302923"
        strokeWidth="9"
      />

      {/* Front cabin */}

      <path
        d="M475 100 H461 V229 H590 L505 116 Q494 100 475 100Z"
        fill="#E6D5B9"
        stroke="#302923"
        strokeWidth="7"
      />

      {/* Windshield */}

      <path
        d="M492 119 L557 208 H482 V119Z"
        fill="url(#vanWindow)"
        stroke="#302923"
        strokeWidth="6"
      />

      {/* Side window */}

      <rect
        x="117"
        y="111"
        width="130"
        height="88"
        rx="8"
        fill="url(#vanWindow)"
        stroke="#302923"
        strokeWidth="7"
      />

      <path d="M180 113 V197" stroke="#D8C7AE" strokeWidth="5" />

      {/* Serving hatch */}

      <rect
        x="265"
        y="108"
        width="173"
        height="105"
        rx="5"
        fill="#29231D"
        stroke="#302923"
        strokeWidth="7"
      />

      <rect x="276" y="119" width="151" height="83" rx="2" fill="#40352A" />

      {/* Hatch awning */}

      <path
        d="M254 105 L449 105 L434 80 L269 80Z"
        fill="#D97832"
        stroke="#302923"
        strokeWidth="6"
      />

      <path
        d="M278 81 L293 105 M321 81 L335 105 M365 81 L379 105 M408 81 L422 105"
        stroke="#F7D9B2"
        strokeWidth="5"
      />

      {/* Brand name */}

      <text
        x="352"
        y="153"
        textAnchor="middle"
        fill="#F5E9D5"
        fontSize="24"
        fontWeight="900"
        letterSpacing="4"
      >
        VOJCART
      </text>

      <text
        x="352"
        y="177"
        textAnchor="middle"
        fill="#E99A48"
        fontSize="9"
        fontWeight="700"
        letterSpacing="3"
      >
        FOOD ON THE MOVE
      </text>

      {/* Serving counter */}

      <path d="M251 213 H451 L462 230 H242Z" fill="#302923" />

      {/* Lower body stripe */}

      <path d="M91 278 H597 V310 H91Z" fill="#D97832" />

      <path d="M95 316 H580" stroke="#302923" strokeWidth="7" />

      {/* Front headlight */}

      <rect
        x="574"
        y="247"
        width="24"
        height="38"
        rx="6"
        fill="#F5DCA9"
        stroke="#302923"
        strokeWidth="5"
      />

      {/* Rear lights */}

      <rect x="86" y="253" width="15" height="35" rx="3" fill="#B54B34" />

      {/* Wheels */}

      <g>
        <circle cx="193" cy="331" r="42" fill="#1B1917" />

        <circle cx="193" cy="331" r="23" fill="#B6A48B" />

        <circle cx="193" cy="331" r="10" fill="#302923" />

        <circle cx="503" cy="331" r="42" fill="#1B1917" />

        <circle cx="503" cy="331" r="23" fill="#B6A48B" />

        <circle cx="503" cy="331" r="10" fill="#302923" />
      </g>

      {/* Decorative location sign */}

      <g transform="translate(95 30)">
        <path d="M0 0 H150 L163 18 L150 36 H0Z" fill="#D97832" />

        <text
          x="70"
          y="23"
          textAnchor="middle"
          fill="#211A14"
          fontSize="11"
          fontWeight="900"
          letterSpacing="2"
        >
          GOOD FOOD AHEAD
        </text>
      </g>

      {/* Small decorative stars */}

      <path
        d="M580 63 L586 78 L601 84 L586 90 L580 105 L574 90 L559 84 L574 78Z"
        fill="#D97832"
      />

      <circle cx="625" cy="132" r="5" fill="#D97832" />

      <circle cx="67" cy="205" r="5" fill="#D97832" />
    </svg>
  );
}

function MenuPage() {
  const queryClient = useQueryClient();

  const [foodType, setFoodType] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Keep customer menu availability in sync with admin changes.
  useEffect(() => {
    const handleAvailabilityUpdate = ({ productId, isAvailable }) => {
      if (!productId || typeof isAvailable !== "boolean") return;

      queryClient.setQueriesData({ queryKey: ["public-menu"] }, (oldData) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            products: (page.products || []).map((product) =>
              product._id === productId ? { ...product, isAvailable } : product,
            ),
          })),
        };
      });
    };

    const handleSocketConnect = () => {
      queryClient.invalidateQueries({ queryKey: ["public-menu"] });
    };

    socket.on("product:availability-updated", handleAvailabilityUpdate);
    socket.on("connect", handleSocketConnect);
    socket.connect();

    return () => {
      socket.off("product:availability-updated", handleAvailabilityUpdate);
      socket.off("connect", handleSocketConnect);
      socket.disconnect();
    };
  }, [queryClient]);

  // Debounce menu search to avoid an API request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFoodType = (value) => {
    setFoodType(value);
    setCategory("");
  };

  const menuQuery = useInfiniteQuery({
    queryKey: [
      "public-menu",
      {
        foodType,
        category,
        search: debouncedSearch,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      getMenu({
        page: pageParam,
        limit: 12,
        foodType: foodType || undefined,
        category: category || undefined,
        search: debouncedSearch || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 30 * 1000,
  });

  const products = useMemo(
    () => menuQuery.data?.pages.flatMap((page) => page.products || []) || [],
    [menuQuery.data],
  );

  const categories = menuQuery.data?.pages[0]?.categories || [];

  // Featured products are selected from the products currently loaded.
  const featuredProducts = useMemo(
    () =>
      products
        .filter((product) => product.featured && product.isAvailable)
        .slice(0, 3),
    [products],
  );

  const activeFeaturedProduct =
    featuredProducts[featuredIndex] || featuredProducts[0];

  useEffect(() => {
    setFeaturedIndex(0);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (featuredProducts.length <= 1) return undefined;

    const interval = setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featuredProducts.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  const selectedCategory = categories.find((item) => item.slug === category);

  const sectionTitle =
    selectedCategory?.name ||
    (foodType === "veg"
      ? "Vegetarian Selection"
      : foodType === "non-veg"
        ? "Non-Vegetarian Selection"
        : foodType === "drink"
          ? "Refreshing Drinks"
          : "Explore Our Menu");

  const totalProducts =
    menuQuery.data?.pages[0]?.pagination?.total ?? products.length;

  const clearFilters = () => {
    setSearch("");
    setFoodType("");
    setCategory("");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#F2EBDD] text-[#28231E]">
      {/* NAVIGATION */}

      <header className="sticky top-0 z-50 border-b border-[#29231E]/10 bg-[#F7F2E8]/95 shadow-[0_4px_20px_rgba(41,35,30,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:px-12">
          {/* Brand */}
          <a href="#home" className="group flex shrink-0 items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#29231E] text-[#E99A48] shadow-md transition duration-300 group-hover:-rotate-3 group-hover:bg-[#D97832] group-hover:text-[#29231E]">
              <Utensils size={21} strokeWidth={2.2} />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#F7F2E8] bg-[#D97832]" />
            </span>

            <span className="flex flex-col">
              <span className="text-[21px] font-black leading-none tracking-[0.08em] text-[#29231E]">
                VOJ<span className="text-[#D97832]">CART</span>
              </span>
              <span className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-[#8A7967]">
                Street food · On wheels
              </span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: "Home", href: "#home" },
              { label: "Our Menu", href: "#menu" },
              { label: "Our Story", href: "#about" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative rounded-lg px-5 py-2.5 text-[13px] font-semibold tracking-wide text-[#74685B] transition-colors duration-200 hover:text-[#D97832]"
              >
                {item.label}
                <span className="absolute bottom-1 left-5 right-5 h-[2px] origin-left scale-x-0 rounded-full bg-[#D97832] transition-transform duration-200 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-3">
            <a
              href="/admin/login"
              className="group hidden items-center gap-2.5 rounded-xl border border-[#29231E]/15 bg-[#29231E] px-4 py-2.5 text-[12px] font-bold tracking-wide text-[#F7F2E8] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D97832] hover:bg-[#D97832] hover:text-[#29231E] hover:shadow-md sm:inline-flex"
            >
              <ShieldCheck size={16} strokeWidth={2.2} />
              <span>Admin Panel</span>
              <ArrowUpRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>

            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#29231E]/15 bg-white/60 text-[#29231E] transition hover:border-[#D97832] hover:bg-[#E9DECC] md:hidden"
              aria-label={
                mobileMenuOpen ? "Close navigation" : "Open navigation"
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden border-t border-[#29231E]/10 bg-[#F7F2E8] md:hidden"
            >
              <nav className="mx-auto flex max-w-[1440px] flex-col gap-1 px-4 py-4 sm:px-7">
                {[
                  { label: "Home", href: "#home" },
                  { label: "Our Menu", href: "#menu" },
                  { label: "Our Story", href: "#about" },
                ].map((item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-[#5F554A] transition hover:bg-[#E9DECC] hover:text-[#D97832]"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight size={15} className="text-[#A18E79]" />
                  </a>
                ))}

                <div className="my-2 border-t border-[#29231E]/10" />

                <a
                  href="/admin/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-[#29231E] px-4 py-3.5 text-sm font-bold text-[#F7F2E8] shadow-sm transition hover:bg-[#D97832] hover:text-[#29231E]"
                >
                  <ShieldCheck size={17} />
                  Admin Panel
                  <ArrowUpRight size={15} />
                </a>

                <p className="pt-3 text-center text-[9px] font-bold uppercase tracking-[0.22em] text-[#A18E79]">
                  Fresh food · Made on wheels
                </p>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section id="home" className="relative bg-[#E9DECB]">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-7 sm:py-14 lg:px-12 lg:py-20">
          <div className="grid items-center gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              className="relative z-10"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D97832]/30 bg-[#D97832]/10 px-3.5 py-2 sm:mb-6">
                <MapPin size={13} className="text-[#C56A2D]" />
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#9C5729] sm:text-[10px] sm:tracking-[0.18em]">
                  Your Local Food Stop
                </span>
              </div>

              <h1 className="max-w-xl text-[clamp(2.8rem,10vw,6.2rem)] font-black leading-[0.94] tracking-[-0.065em] text-[#29231E] sm:text-[clamp(3.4rem,7vw,6.2rem)]">
                GOOD FOOD.
                <br />
                <span className="text-[#D97832]">GREAT</span>
                <br />
                JOURNEYS.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-[#75695B] sm:mt-7 sm:text-base sm:leading-7">
                From our camper van to your plate. Enjoy delicious burgers,
                crispy fries and refreshing drinks made to bring a little
                happiness to your day.
              </p>

              <a
                href="#menu"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#D97832] px-5 py-3.5 text-[10px] font-black tracking-[0.12em] text-[#211A14] shadow-lg shadow-[#D97832]/20 transition hover:-translate-y-0.5 hover:bg-[#E78A43] sm:mt-8 sm:px-6 sm:text-xs"
              >
                EXPLORE OUR MENU
                <ArrowDown size={16} />
              </a>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-[#302820]/15 pt-5 sm:mt-10 sm:gap-x-6 sm:pt-6">
                {[
                  ["BURGERS", "Juicy & Delicious"],
                  ["FRIES", "Crispy & Fresh"],
                  ["DRINKS", "Cool & Refreshing"],
                ].map(([title, subtitle], index) => (
                  <div key={title} className="flex items-center gap-4">
                    {index > 0 && <span className="h-8 w-px bg-[#302820]/15" />}
                    <div>
                      <p className="text-sm font-black sm:text-lg">{title}</p>
                      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#918171] sm:text-[9px]">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Camper van and featured product stay in normal document flow.
                This prevents the carousel from being clipped on small screens. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65 }}
              className="relative mx-auto w-full max-w-[680px] pt-1"
            >
              <div className="absolute inset-8 rounded-full bg-[#D97832]/15 blur-[70px]" />
              <div className="relative rounded-[20px] border border-[#302820]/10 bg-[#E1D2BA] p-2.5 shadow-xl shadow-[#302820]/10 sm:rounded-[28px] sm:p-5">
                <div className="mb-1.5 flex items-center justify-between gap-2 px-1.5 sm:mb-2 sm:px-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.16em] text-[#897966] sm:text-[9px] sm:tracking-[0.22em]">
                    VOJCART MOBILE KITCHEN
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-[#9C5729] sm:text-[9px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D97832]" />
                    FRESHLY SERVED
                  </span>
                </div>

                <div className="w-full">
                  <CamperVanIllustration />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-[#302820]/10 px-1.5 pt-2 sm:px-2 sm:pt-3">
                  <div className="flex min-w-0 items-center gap-2 text-[#716456]">
                    <Route size={13} className="shrink-0" />
                    <span className="truncate text-[8px] font-bold uppercase tracking-[0.1em] sm:text-[9px] sm:tracking-[0.15em]">
                      Good Food. Good Mood.
                    </span>
                  </div>
                  <span className="shrink-0 text-[8px] font-black tracking-widest text-[#D97832] sm:text-[9px]">
                    EST. VOJCART
                  </span>
                </div>
              </div>

              {featuredProducts.length > 0 && activeFeaturedProduct && (
                <div className="relative z-10 mx-3 mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#29231E] p-3.5 shadow-xl sm:mx-6 sm:mt-4 sm:p-5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E99A48]">
                      VAN FAVOURITE
                    </p>
                    <span className="text-[9px] font-bold tabular-nums text-white/40">
                      {String(featuredIndex + 1).padStart(2, "0")} /{" "}
                      {String(featuredProducts.length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative min-h-[48px] overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeFeaturedProduct._id}
                        initial={{ opacity: 0, x: 28 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -28 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#F4EBDC] sm:text-base">
                            {activeFeaturedProduct.name}
                          </p>
                          <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-white/40 sm:text-[9px]">
                            Customer Favourite
                          </p>
                        </div>
                        <p className="shrink-0 text-lg font-black text-[#E99A48] sm:text-xl">
                          ₹{activeFeaturedProduct.price}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {featuredProducts.length > 1 && (
                    <div className="mt-3 flex items-center gap-1.5">
                      {featuredProducts.map((product, index) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => setFeaturedIndex(index)}
                          aria-label={`Show featured product ${index + 1}`}
                          aria-current={featuredIndex === index}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            featuredIndex === index
                              ? "w-7 bg-[#D97832]"
                              : "w-2 bg-white/25 hover:bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="flex h-1.5 sm:h-2">
          <div className="w-1/3 bg-[#29231E]" />
          <div className="w-1/3 bg-[#D97832]" />
          <div className="w-1/3 bg-[#E4CDAA]" />
        </div>
      </section>

      {/* MENU */}
      <section
        id="menu"
        className="relative scroll-mt-[66px] overflow-x-clip bg-[#E9DECC] sm:scroll-mt-[72px]"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-28 top-24 h-72 w-72 rounded-full border border-[#A8754E]/10 sm:-right-32 sm:h-80 sm:w-80" />
          <div className="absolute -right-16 top-36 h-52 w-52 rounded-full border border-[#A8754E]/10 sm:-right-20 sm:h-60 sm:w-60" />
          <div className="absolute -left-28 bottom-40 h-72 w-72 rounded-full border border-[#A8754E]/10 sm:-left-32 sm:h-80 sm:w-80" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 py-10 sm:px-7 sm:py-14 lg:px-12 lg:py-20">
          {/* Menu introduction and search */}
          <div className="relative overflow-hidden rounded-[20px] bg-[#29231E] px-5 py-7 text-[#F7F0E5] shadow-[0_18px_45px_rgba(41,35,30,0.16)] sm:rounded-[28px] sm:px-9 sm:py-10 lg:px-14 lg:py-12">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/[0.07] sm:h-72 sm:w-72" />
            <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/[0.07] sm:h-56 sm:w-56" />

            <div className="relative grid gap-7 lg:grid-cols-[1fr_350px] lg:items-end lg:gap-10">
              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-3 sm:mb-5">
                  <span className="h-[2px] w-8 shrink-0 bg-[#D97832] sm:w-9" />
                  <p className="text-[9px] font-black uppercase tracking-[0.19em] text-[#E99A48] sm:text-[10px] sm:tracking-[0.25em]">
                    VOJCART · FOOD ON THE MOVE
                  </p>
                </div>

                <h2 className="text-[clamp(2.4rem,9vw,4.8rem)] font-black leading-[0.96] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
                  GOOD FOOD.
                  <br />
                  <span className="text-[#E99A48]">RIGHT HERE.</span>
                </h2>

                <p className="mt-4 max-w-md text-xs leading-6 text-[#D2C5B5] sm:mt-5 sm:text-sm sm:leading-6">
                  Freshly prepared favourites, served straight from our van.
                  Take a look at what&apos;s cooking today.
                </p>
              </div>

              <div className="w-full min-w-0">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="menu-search"
                    className="text-[9px] font-black uppercase tracking-[0.16em] text-[#E99A48] sm:tracking-[0.2em]"
                  >
                    FIND YOUR FAVOURITE
                  </label>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 sm:text-[9px]">
                    MENU SEARCH
                  </span>
                </div>

                <div className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#F7F0E5] px-3.5 py-3 sm:px-4">
                  <Search size={17} className="shrink-0 text-[#A35E32]" />
                  <input
                    id="menu-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Burgers, fries, drinks..."
                    className="w-full min-w-0 bg-transparent text-sm font-medium text-[#29231E] outline-none placeholder:text-[#A99A88]"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="shrink-0 text-[#8A7D6E] transition hover:text-[#D97832]"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1.5 w-full bg-[#D97832]" />
          </div>

          {/* Filters */}
          <div className="mt-8 sm:mt-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A35E32] sm:text-[10px]">
                  PICK YOUR CRAVING
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-[#29231E] sm:text-3xl">
                  Explore the menu
                </h3>
              </div>

              <div
                className="flex max-w-full gap-2 overflow-x-auto pb-1"
                aria-label="Filter by food type"
              >
                {foodFilters.map((filter) => (
                  <button
                    key={filter.value || "all"}
                    type="button"
                    onClick={() => handleFoodType(filter.value)}
                    aria-pressed={foodType === filter.value}
                    className={`min-h-10 shrink-0 rounded-full px-4 py-2.5 text-[9px] font-black uppercase tracking-wider transition-all sm:px-5 sm:text-[10px] ${
                      foodType === filter.value
                        ? "bg-[#D97832] text-[#211A14] shadow-md shadow-[#D97832]/20"
                        : "border border-[#302820]/15 bg-[#F7F2E8] text-[#6E5E4D] hover:border-[#D97832] hover:text-[#A35E32]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mt-5 border-b border-[#302820]/15 pb-4 sm:mt-7 sm:pb-5">
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  <span className="mr-1 shrink-0 text-[8px] font-black uppercase tracking-[0.16em] text-[#9A8068] sm:text-[9px] sm:tracking-widest">
                    CATEGORIES
                  </span>

                  <button
                    type="button"
                    onClick={() => setCategory("")}
                    aria-pressed={!category}
                    className={`min-h-9 shrink-0 rounded-md px-3.5 py-2 text-[10px] font-bold transition sm:px-4 sm:text-[11px] ${
                      !category
                        ? "bg-[#29231E] text-[#F7F0E5]"
                        : "bg-[#F7F2E8] text-[#817365] hover:bg-[#E1D2BA]"
                    }`}
                  >
                    All
                  </button>

                  {categories.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setCategory(item.slug)}
                      aria-pressed={category === item.slug}
                      className={`min-h-9 shrink-0 rounded-md px-3.5 py-2 text-[10px] font-bold transition sm:px-4 sm:text-[11px] ${
                        category === item.slug
                          ? "bg-[#29231E] text-[#F7F0E5]"
                          : "bg-[#F7F2E8] text-[#817365] hover:bg-[#E1D2BA]"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product heading */}
          <div className="mb-5 mt-8 flex items-end justify-between gap-3 sm:mb-7 sm:mt-9">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D97832]" />
                <p className="text-[8px] font-black uppercase tracking-[0.17em] text-[#A35E32] sm:text-[9px] sm:tracking-[0.2em]">
                  FRESH FROM THE KITCHEN
                </p>
              </div>
              <h3 className="mt-1.5 break-words text-xl font-black tracking-tight text-[#29231E] sm:mt-2 sm:text-3xl">
                {sectionTitle}
                <span className="text-[#D97832]">.</span>
              </h3>
            </div>

            {!menuQuery.isPending && (
              <p className="shrink-0 pb-1 text-[10px] font-bold text-[#897764] sm:text-xs">
                {totalProducts} {totalProducts === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          {/* Error */}
          {menuQuery.isError && !menuQuery.data && (
            <div className="rounded-2xl border border-[#302820]/10 bg-[#F7F2E8] px-5 py-10 text-center sm:px-6 sm:py-12">
              <p className="font-bold text-[#29231E]">
                Unable to load the menu
              </p>
              <p className="mt-2 text-xs text-[#8A7D6E] sm:text-sm">
                Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => menuQuery.refetch()}
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#D97832] px-5 py-3 text-[10px] font-black text-[#211A14] transition hover:bg-[#E99A48] sm:text-xs"
              >
                <RefreshCw size={14} />
                TRY AGAIN
              </button>
            </div>
          )}

          {/* Products */}
          {menuQuery.isPending ? (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : menuQuery.data ? (
            products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#302820]/10 bg-[#F7F2E8] px-5 py-12 text-center sm:py-16">
                <Utensils size={28} className="mx-auto text-[#D97832]" />
                <h3 className="mt-4 text-lg font-black text-[#29231E] sm:text-xl">
                  Nothing on the menu
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#8A7D6E] sm:text-sm">
                  Try another category or search for something else.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 min-h-10 text-[10px] font-black uppercase tracking-wider text-[#B9652E] underline underline-offset-4 sm:text-xs"
                >
                  Clear Filters
                </button>
              </div>
            )
          ) : null}

          {/* Pagination */}
          {menuQuery.hasNextPage && !menuQuery.isError && (
            <div className="mt-8 flex justify-center sm:mt-12">
              <button
                type="button"
                onClick={() => menuQuery.fetchNextPage()}
                disabled={menuQuery.isFetchingNextPage}
                className="flex min-h-12 min-w-[175px] items-center justify-center gap-3 rounded-lg border border-[#29231E]/30 bg-[#29231E] px-6 py-3.5 text-[9px] font-black tracking-[0.15em] text-[#F7F0E5] transition hover:border-[#D97832] hover:bg-[#D97832] hover:text-[#211A14] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[190px] sm:px-7 sm:py-4 sm:text-[10px]"
              >
                {menuQuery.isFetchingNextPage ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    LOADING...
                  </>
                ) : (
                  <>
                    LOAD MORE
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          )}

          {menuQuery.isFetchNextPageError && (
            <p className="mt-4 text-center text-xs text-[#B54B34] sm:text-sm">
              Unable to load more products. Please try again.
            </p>
          )}

          <div className="mt-10 flex items-center justify-center gap-3 sm:mt-14">
            <span className="h-px w-8 bg-[#A8754E]/40 sm:w-10" />
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#9A8068] sm:text-[9px] sm:tracking-[0.25em]">
              GOOD FOOD · GOOD MOOD
            </p>
            <span className="h-px w-8 bg-[#A8754E]/40 sm:w-10" />
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section
        id="about"
        className="border-t border-white/10 bg-[#29231E] text-[#F5EBDD]"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-11 sm:px-7 sm:py-14 lg:px-12">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center md:gap-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[#D97832]" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E99A48] sm:text-[10px] sm:tracking-[0.22em]">
                  A LITTLE ABOUT US
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">
                OUR VAN.
                <span className="text-[#D97832]"> OUR PASSION.</span>
              </h2>

              <p className="mt-4 max-w-xl text-xs leading-6 text-white/55 sm:text-sm sm:leading-7">
                VojCart brings together the fun of street food and the freedom
                of life on the road. We serve burgers, fries and drinks with a
                simple idea: good food should always bring a smile.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5 sm:px-5 sm:py-4">
              <Clock3 size={19} className="shrink-0 text-[#E99A48]" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider sm:text-xs">
                  GOOD FOOD
                </p>
                <p className="mt-1 text-[9px] text-white/40 sm:text-[10px]">
                  GOOD MOOD. ALWAYS.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 sm:mt-10 sm:pt-6">
            <p className="text-xs font-black tracking-[0.15em]">
              VOJ<span className="text-[#E99A48]">CART</span>
            </p>
            <p className="text-[9px] text-white/35 sm:text-[10px]">
              © {new Date().getFullYear()} VojCart. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MenuPage;
