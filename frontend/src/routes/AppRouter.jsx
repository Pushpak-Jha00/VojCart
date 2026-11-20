import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

const MenuPage = lazy(() => import("../pages/customer/MenuPage"));

const LoginPage = lazy(() => import("../pages/admin/LoginPage"));

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));

const ProductsPage = lazy(() => import("../pages/admin/ProductsPage"));

const CategoriesPage = lazy(() => import("../pages/admin/CategoriesPage"));

const QRCodePage = lazy(() => import("../pages/admin/QRCodePage"));

const NotFound = lazy(() => import("../pages/NotFound"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#171717] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-[#E99A48] border-t-transparent animate-spin" />
    </div>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Customer */}
          <Route path="/" element={<Navigate to="/menu" replace />} />

          <Route path="/menu" element={<MenuPage />} />

          {/* Admin authentication */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected admin pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />

              <Route path="products" element={<ProductsPage />} />

              <Route path="categories" element={<CategoriesPage />} />

              <Route path="qr-code" element={<QRCodePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
