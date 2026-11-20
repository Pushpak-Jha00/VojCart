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
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#302820]/15 bg-[#F3EADB] shadow-[0_5px_18px_rgba(48,40,32,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D97832]/60 hover:shadow-[0_15px_35px_rgba(48,40,32,0.13)] sm:rounded-2xl"
    >
      {/* Product image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#DED0BA] p-1.5 sm:aspect-[5/4] sm:p-2">
        <div className="relative h-full overflow-hidden rounded-lg sm:rounded-xl">
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
              <span className="text-xs font-black tracking-[0.2em] text-[#A35E32] sm:text-sm">
                VOJCART
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#211A14]/65 via-transparent to-black/10" />

          {/* Food type */}
          <div className="absolute left-1.5 top-1.5 sm:left-3 sm:top-3">
            <span className="flex items-center gap-1 rounded-md border border-white/20 bg-[#29231E]/90 px-1.5 py-1 text-[7px] font-black tracking-wider text-[#F5EBDD] backdrop-blur-sm sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[9px]">
              <TypeIcon size={10} className="sm:h-3 sm:w-3" />
              {type.label}
            </span>
          </div>

          {/* Favourite badge */}
          {product.featured && product.isAvailable && (
            <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md bg-[#E99A48] px-1.5 py-1 text-[7px] font-black uppercase tracking-wide text-[#29231E] shadow-md sm:right-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[9px]">
              <Star
                size={9}
                fill="currentColor"
                className="sm:h-[11px] sm:w-[11px]"
              />
              Favourite
            </div>
          )}

          {/* Van signature */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 sm:bottom-3 sm:left-3 sm:gap-2">
            <span className="h-[2px] w-3 bg-[#E99A48] sm:w-5" />
            <span className="text-[7px] font-black uppercase tracking-wider text-white sm:text-[9px] sm:tracking-[0.18em]">
              Fresh from our van
            </span>
          </div>

          {/* Unavailable overlay */}
          {!product.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#29231E]/45">
              <span className="border border-[#F0B46F]/60 bg-[#29231E] px-2 py-1.5 text-[7px] font-black tracking-wider text-[#F0B46F] sm:px-4 sm:py-2 sm:text-[9px] sm:tracking-[0.15em]">
                CURRENTLY UNAVAILABLE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
        {/* Category */}
        <div className="mb-1 flex items-center justify-between gap-1 sm:mb-2">
          <p className="truncate text-[7px] font-black uppercase tracking-wider text-[#A35E32] sm:text-[9px] sm:tracking-[0.2em]">
            {product.category?.name || "VOJCART SPECIAL"}
          </p>

          <ArrowUpRight
            size={13}
            className="shrink-0 text-[#A38F7B] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#D97832] sm:h-4 sm:w-4"
          />
        </div>

        {/* Name */}
        <h3 className="line-clamp-2 min-h-9 text-xs font-black leading-4 tracking-tight text-[#29231E] sm:min-h-0 sm:text-lg sm:leading-normal">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-[#817365] sm:mt-2 sm:min-h-10 sm:text-xs sm:leading-5">
          {product.description}
        </p>

        {/* Price and availability */}
        <div className="mt-auto flex items-end justify-between gap-1.5 border-t border-dashed border-[#302820]/20 pt-2.5 sm:mt-4 sm:gap-3 sm:pt-4">
          <div className="min-w-0">
            <p className="text-[7px] font-black uppercase tracking-wider text-[#9A8C7D] sm:text-[9px] sm:tracking-[0.16em]">
              MENU PRICE
            </p>

            <p className="mt-1 text-base font-black leading-none tracking-tight text-[#29231E] sm:text-2xl">
              ₹{Number(product.price || 0).toFixed(0)}
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1.5 text-[7px] font-black uppercase tracking-wide sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-[9px] ${
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
                <Clock3 size={10} className="sm:h-3 sm:w-3" />
                Unavailable
              </>
            )}
          </div>
        </div>

        {/* Camper van signature stripe */}
        <div className="mt-2.5 flex h-[3px] overflow-hidden rounded-full sm:mt-4 sm:h-[4px]">
          <div className="w-[65%] bg-[#29231E]" />
          <div className="w-[35%] bg-[#D97832]" />
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
