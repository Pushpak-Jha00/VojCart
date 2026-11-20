import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="min-h-screen bg-[#171717] text-white flex flex-col items-center justify-center">
      <h1 className="text-7xl font-bold text-[#E99A48]">404</h1>

      <p className="mt-4 text-white/60">This page could not be found.</p>

      <Link
        to="/menu"
        className="mt-6 rounded-lg bg-[#E99A48] px-6 py-3 text-black font-semibold"
      >
        Back to Menu
      </Link>
    </main>
  );
}

export default NotFound;
