import { motion } from "framer-motion";
import {
  Leaf,
  Drumstick,
  CupSoda,
  Clock3,
  Star,
  ArrowUpRight,
} from "lucide-react";

const foodTypeConfig = {
  veg: {
    label: "VEG",
    icon: Leaf,
  },
  "non-veg": {
    label: "NON-VEG",
    icon: Drumstick,
  },
  drink: {
    label: "DRINK",
    icon: CupSoda,
  },
};

function ProductCard({ product, index = 0 }) {
  const type = foodTypeConfig[product.foodType] || foodTypeConfig.veg;

  const TypeIcon = type.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.2),
      }}
      className="group relative overflow-hidden rounded-2xl border border-[#302820]/15 bg-[#F3EADB] shadow-[0_5px_18px_rgba(48,40,32,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D97832]/60 hover:shadow-[0_15px_35px_rgba(48,40,32,0.13)]"
    >
      {/* Product image */}
      <div className="relative aspect-[5/4] overflow-hidden bg-[#DED0BA] p-2">
        <div className="relative h-full overflow-hidden rounded-xl">
          {product.image?.url ? (
            <img
              src={product.image.url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                !product.isAvailable ? "grayscale opacity-50" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#D7C5AA]">
              <span className="text-sm font-black tracking-[0.25em] text-[#A35E32]">
                VOJCART
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#211A14]/65 via-transparent to-black/10" />

          {/* Food type label */}
          <div className="absolute left-3 top-3">
            <span className="flex items-center gap-1.5 rounded-md border border-white/20 bg-[#29231E]/90 px-2.5 py-1.5 text-[9px] font-black tracking-wider text-[#F5EBDD] backdrop-blur-sm">
              <TypeIcon size={12} />
              {type.label}
            </span>
          </div>

          {/* Featured badge */}
          {product.featured && product.isAvailable && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-[#E99A48] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#29231E] shadow-md">
              <Star size={11} fill="currentColor" />
              Favourite
            </div>
          )}

          {/* Van signature */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="h-[2px] w-5 bg-[#E99A48]" />
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white">
              Fresh from our van
            </span>
          </div>

          {/* Unavailable overlay */}
          {!product.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#29231E]/45">
              <span className="border border-[#F0B46F]/60 bg-[#29231E] px-4 py-2 text-[9px] font-black tracking-[0.15em] text-[#F0B46F]">
                CURRENTLY UNAVAILABLE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product details */}
      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        {/* Category */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-[#A35E32]">
            {product.category?.name || "VOJCART SPECIAL"}
          </p>

          <ArrowUpRight
            size={16}
            className="shrink-0 text-[#A38F7B] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#D97832]"
          />
        </div>

        {/* Name */}
        <h3 className="line-clamp-1 text-base font-black tracking-tight text-[#29231E] sm:text-lg">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#817365]">
          {product.description}
        </p>

        {/* Roadside price ticket */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[#302820]/20 pt-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#9A8C7D]">
              MENU PRICE
            </p>

            <p className="mt-1 text-2xl font-black leading-none tracking-tight text-[#29231E]">
              ₹{Number(product.price || 0).toFixed(0)}
            </p>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[9px] font-black uppercase tracking-wider ${
              product.isAvailable
                ? "bg-[#D97832]/15 text-[#A35E32]"
                : "bg-[#302820]/10 text-[#817365]"
            }`}
          >
            {product.isAvailable ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#D97832]" />
                Available
              </>
            ) : (
              <>
                <Clock3 size={12} />
                Unavailable
              </>
            )}
          </div>
        </div>

        {/* Camper van signature stripe */}
        <div className="mt-4 flex h-[4px] overflow-hidden rounded-full">
          <div className="w-[65%] bg-[#29231E]" />
          <div className="w-[35%] bg-[#D97832]" />
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
