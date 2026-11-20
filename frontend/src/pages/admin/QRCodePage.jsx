import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { getMenuQR } from "../../api/qr.api";

const QRCodePage = () => {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-menu-qr"],
    queryFn: getMenuQR,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const qrCode = data?.qrCode;
  const menuUrl = data?.menuUrl;

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "vojcart-menu-qr.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("QR code downloaded");
  };

  const handleCopy = async () => {
    if (!menuUrl) return;

    try {
      await navigator.clipboard.writeText(menuUrl);
      toast.success("Menu link copied");
    } catch {
      toast.error("Unable to copy the menu link");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="animate-spin text-amber-500" size={30} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 text-red-500" size={30} />

        <h2 className="font-semibold text-neutral-900">
          Unable to generate QR code
        </h2>

        <p className="mt-2 text-sm text-neutral-600">
          {error?.response?.data?.message ||
            "Something went wrong. Please try again."}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <QrCode size={19} />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">
              Menu Access
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            QR Code Management
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Let customers scan and explore your digital food menu.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh QR
        </button>
      </div>

      {/* Main QR section */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="qr-print-area rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-9"
        >
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Your public menu QR
            </span>

            <h2 className="mt-5 text-xl font-bold text-neutral-900">
              Scan to explore our menu
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Point your phone camera at this code to view the menu.
            </p>

            <div className="mx-auto mt-7 flex w-full max-w-[310px] items-center justify-center rounded-3xl border border-neutral-100 bg-[#faf9f6] p-5">
              <img
                src={qrCode}
                alt="VojCart public menu QR code"
                className="aspect-square w-full max-w-[260px] object-contain"
              />
            </div>

            <p className="mt-5 text-sm font-bold tracking-widest text-neutral-900">
              VOJCART
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Fresh food. Easy menu access.
            </p>
          </div>
        </motion.section>

        {/* Actions */}
        <div className="space-y-5">
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-neutral-900">QR Code Actions</h3>

            <p className="mt-1 text-sm text-neutral-500">
              Download or print your QR code for display at your food cart.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleDownload}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-neutral-950 transition hover:bg-amber-400"
              >
                <Download size={18} />
                Download QR Code
              </button>

              <button
                onClick={handlePrint}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 py-3.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
              >
                <Printer size={18} />
                Print QR Code
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-neutral-900">Public Menu Link</h3>

            <p className="mt-1 text-sm text-neutral-500">
              This is the page customers will open after scanning.
            </p>

            <div className="mt-4 break-all rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
              {menuUrl}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Copy size={16} />
                Copy Link
              </button>

              <a
                href={menuUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <ExternalLink size={16} />
                Open Menu
              </a>
            </div>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-bold text-neutral-900">
              Display suggestion
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Print this QR code and place it somewhere visible at your food
              cart. Customers can scan it to check available food items and
              prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
