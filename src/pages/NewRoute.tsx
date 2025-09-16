import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Send, Trash2 } from "lucide-react";
import type { Employee, Vehicle, Stop } from "@/types";

type UnloadingPoint = {
  address: string;
  packages: number | "";
  date: string; // datetime-local
};

export default function NewRoute({ onBack }: { onBack: () => void }) {
  const { token } = useAuth();

  const [drivers, setDrivers] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Empresa
  const [companyName, setCompanyName] = useState("");
  const [companyCif, setCompanyCif] = useState("");

  // Transporte
  const [driver, setDriver] = useState("");
  const [vehicle, setVehicle] = useState("");

  // Punto de carga
  const [loadAddress, setLoadAddress] = useState("");
  const [loadPackages, setLoadPackages] = useState<number | "">("");
  const [loadDate, setLoadDate] = useState("");

  // Puntos de descarga
  const [unloads, setUnloads] = useState<UnloadingPoint[]>([
    { address: "", packages: "", date: "" },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const emps = await apiFetch<Employee[]>("/employees", { token });
      setDrivers(emps.filter((e) => e.role === "driver"));

      const vs = await apiFetch<Vehicle[]>("/vehicles", { token });
      setVehicles(vs);
    })();
  }, [token]);

  // --- helpers descarga ---
  const addUnload = () =>
    setUnloads((prev) => [...prev, { address: "", packages: "", date: "" }]);
  const updateUnload = (i: number, k: keyof UnloadingPoint, v: any) =>
    setUnloads((prev) => prev.map((u, idx) => (idx === i ? { ...u, [k]: v } : u)));
  const removeUnload = (i: number) =>
    setUnloads((prev) => prev.filter((_, idx) => idx !== i));

  // --- crear ruta ---
  const createRoute = async () => {
    if (!driver || !vehicle) return alert("Falta conductor o vehículo");

    const composedStops: Stop[] = [];

    // 1) Punto de Carga
    composedStops.push({
      name: `Punto de Carga (${companyName || "Empresa"})`,
      address: loadAddress || "(sin dirección)",
      notes: `CIF: ${companyCif || "—"} | Bultos: ${loadPackages || 0}`,
      eta: loadDate ? new Date(loadDate).toISOString() : undefined,
    });

    // 2) Descargas
    unloads.forEach((u, idx) => {
      const hasData = u.address || u.packages || u.date;
      if (!hasData) return;
      composedStops.push({
        name: `Descarga ${idx + 1}`,
        address: u.address || "(sin dirección)",
        notes: `Bultos descargados: ${u.packages || 0}`,
        eta: u.date ? new Date(u.date).toISOString() : undefined,
      });
    });

    setLoading(true);
    try {
      await apiFetch("/routes", {
        method: "POST",
        token,
        body: {
          driver,
          vehicle,
          start: new Date().toISOString(),
          stops: composedStops,
        },
      });
      alert("Ruta creada");
      onBack();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Columna izquierda: Empresa + Transporte */}
      <div className="md:col-span-1 space-y-4">
        {/* Empresa */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Nombre de la empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input
              placeholder="CIF"
              value={companyCif}
              onChange={(e) => setCompanyCif(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Transporte */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="border rounded-xl px-3 py-2 w-full"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
            >
              <option value="">Selecciona conductor</option>
              {drivers.map((d) => (
                <option key={d.id} value={`${d.name} ${d.surname}`}>
                  {d.name} {d.surname}
                </option>
              ))}
            </select>

            <select
              className="border rounded-xl px-3 py-2 w-full"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            >
              <option value="">Selecciona vehículo</option>
              {vehicles.map((v) => (
                <option key={v.id} value={`${v.model} - ${v.plate}`}>
                  {v.model} · {v.plate}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={onBack}>
                Cancelar
              </Button>
              <Button onClick={createRoute} disabled={loading}>
                <Send className="h-4 w-4" /> {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha: Carga y Descargas */}
      <div className="md:col-span-2 space-y-4">
        {/* Punto de Carga */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Punto de Carga</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-3">
            <Input
              placeholder="Dirección"
              value={loadAddress}
              onChange={(e) => setLoadAddress(e.target.value)}
            />
            <Input
              type="number"
              min={0}
              placeholder="Nº de bultos"
              value={loadPackages === "" ? "" : String(loadPackages)}
              onChange={(e) =>
                setLoadPackages(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))
              }
            />
            <Input
              type="datetime-local"
              value={loadDate}
              onChange={(e) => setLoadDate(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Puntos de Descarga */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Puntos de Descarga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unloads.map((u, i) => (
              <div key={i} className="grid sm:grid-cols-4 gap-3 p-3 rounded-2xl border">
                <Input
                  placeholder="Dirección"
                  value={u.address}
                  onChange={(e) => updateUnload(i, "address", e.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Bultos descargados"
                  value={u.packages === "" ? "" : String(u.packages)}
                  onChange={(e) =>
                    updateUnload(
                      i,
                      "packages",
                      e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                    )
                  }
                />
                <Input
                  type="datetime-local"
                  value={u.date}
                  onChange={(e) => updateUnload(i, "date", e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => removeUnload(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={addUnload}>
              <Plus className="h-4 w-4" /> Añadir zona de descarga
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
