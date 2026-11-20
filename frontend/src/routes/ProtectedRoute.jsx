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
    refetchOnWindowFocus: false,
  });

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#171717]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E99A48] border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    if (error?.response?.status === 401) {
      return <Navigate to="/admin/login" replace />;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#171717] text-white">
        <p>Unable to verify your admin session.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#E99A48] px-5 py-2 font-semibold text-black"
        >
          Retry
        </button>
      </div>
    );
  }

  return data ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default ProtectedRoute;
