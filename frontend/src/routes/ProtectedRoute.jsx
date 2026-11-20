import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

function ProtectedRoute() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      return response.data.admin;
    },
    retry: false,
  });

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#E99A48] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError) {
    if (error.response?.status === 401) {
      return <Navigate to="/admin/login" replace />;
    }

    return (
      <div className="min-h-screen bg-[#171717] text-white flex flex-col items-center justify-center gap-3">
        <p>Unable to verify your admin session.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#E99A48] px-5 py-2 text-black"
        >
          Retry
        </button>
      </div>
    );
  }

  return data ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default ProtectedRoute;
