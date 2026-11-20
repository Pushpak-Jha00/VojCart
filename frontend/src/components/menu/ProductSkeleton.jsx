function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#302820]/15 bg-[#EDE3D2] animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-[#D8CBB7] p-3">
        <div className="h-full w-full rounded-xl bg-[#CFC0AA]" />
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        <div className="h-3 w-20 rounded-full bg-[#C9B9A3]" />

        <div className="h-5 w-3/4 rounded-md bg-[#C9B9A3]" />

        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-[#D5C7B2]" />
          <div className="h-3 w-2/3 rounded-full bg-[#D5C7B2]" />
        </div>

        {/* Price and availability */}
        <div className="flex items-center justify-between border-t border-dashed border-[#302820]/20 pt-4">
          <div className="h-6 w-16 rounded-md bg-[#C9B9A3]" />
          <div className="h-4 w-20 rounded-full bg-[#D97832]/25" />
        </div>
      </div>

      {/* Camper van accent stripe */}
      <div className="h-1 bg-[#D97832]/60" />
    </div>
  );
}

export default ProductSkeleton;
