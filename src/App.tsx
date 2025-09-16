import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AuthProvider, { useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import NewRoute from "@/pages/NewRoute";
import Vehicles from "@/pages/Vehicles";
import Employees from "@/pages/Employees";
import About from "@/pages/About";
import Driver from "@/pages/Driver";
import { Button } from "@/components/ui/button";

type Tab = "admin" | "driver" | "new" | "vehicles" | "employees" | "about";

function Shell() {
  const { token, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("admin");

  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <Login onLoggedIn={() => setTab("admin")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-black text-white grid place-items-center font-bold">
              T
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">TransLite – MVP</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Gestión de rutas y entregas
              </p>
            </div>
          </div>

          {/* Navegación (escritorio) */}
          <nav className="hidden md:flex gap-2">
            <Button
              variant={tab === "admin" ? "default" : "outline"}
              onClick={() => setTab("admin")}
            >
              Panel Admin
            </Button>
            <Button
              variant={tab === "new" ? "default" : "outline"}
              onClick={() => setTab("new")}
            >
              Crear Ruta
            </Button>
            <Button
              variant={tab === "vehicles" ? "default" : "outline"}
              onClick={() => setTab("vehicles")}
            >
              Vehículos
            </Button>
            <Button
              variant={tab === "employees" ? "default" : "outline"}
              onClick={() => setTab("employees")}
            >
              Empleados
            </Button>

            {/* Cerrar sesión (escritorio) */}
            <Button variant="destructive" onClick={logout}>
              Cerrar sesión
            </Button>
          </nav>

          {/* Navegación (móvil) */}
          <div className="md:hidden w-full max-w-xs">
            <select
              className="border rounded-xl px-3 py-2 text-sm w-full"
              value={tab}
              onChange={(e) => setTab(e.target.value as Tab)}
            >
              <option value="admin">Panel Admin</option>
              <option value="new">Crear Ruta</option>
              <option value="vehicles">Vehículos</option>
              <option value="employees">Empleados</option>
            </select>
            <div className="mt-2">
              <Button variant="destructive" className="w-full" onClick={logout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {tab === "about" && <About key="about" />}
          {tab === "admin" && (
            <Admin
              key="admin"
              onNewRoute={() => setTab("new")}
              onGoEmployees={() => setTab("employees")}
              onGoVehicles={() => setTab("vehicles")}
            />
          )}
          {tab === "driver" && <Driver key="driver" />}
          {tab === "new" && <NewRoute key="new" onBack={() => setTab("admin")} />}
          {tab === "vehicles" && <Vehicles key="vehicles" />}
          {tab === "employees" && <Employees key="employees" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
