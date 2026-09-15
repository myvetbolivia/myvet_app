import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FiltersProvider } from "./lib/useSearchFilters";

import Home from "./pages/Home";
import Results from "./pages/Results";
import VetProfile from "./pages/VetProfile";
import Plans from "./pages/Plans";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import ClientAuth from "./pages/ClientAuth";
import VetRegister from "./pages/VetRegister";
import VetLogin from "./pages/VetLogin";
import VetDashboard from "./pages/VetDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminAdmins from "./pages/admin/Admins";

export default function App() {
  return (
    <AuthProvider>
      <FiltersProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resultados" element={<Results />} />
          <Route path="/veterinario/:id" element={<VetProfile />} />
          <Route path="/planes" element={<Plans />} />
          <Route path="/ayuda" element={<Support />} />
          <Route path="/terminos" element={<Terms />} />
          <Route path="/ingresar" element={<ClientAuth />} />

          <Route path="/veterinario/registro" element={<VetRegister />} />
          <Route path="/veterinario/ingresar" element={<VetLogin />} />
          <Route path="/veterinario/panel" element={<VetDashboard />} />

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="veterinarios" element={<AdminDashboard />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="administradores" element={<AdminAdmins />} />
          </Route>

          <Route path="*" element={<Home />} />
        </Routes>
      </FiltersProvider>
    </AuthProvider>
  );
}
