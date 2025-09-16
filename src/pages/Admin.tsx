import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, apiUpload, apiDelete } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt,
  Trash2,
} from "lucide-react";
import type { RouteItem, Stop } from "@/types";

type RouteFile = {
  id: number;
  routeId: number;
  type: "INVOICE" | "RECEIPT" | "OTHER";
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
};

const formatTime = (d: string | Date) =>
  new Date(d).toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

type Props = {
  onNewRoute: () => void;
  onGoEmployees: () => void;
  onGoVehicles: () => void;
};

// ---------- Calendario helpers ----------
type CalendarDay = { date: Date; inMonth: boolean };
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getMonthGrid(current: Date): CalendarDay[] {
  const first = startOfMonth(current);
  const last = endOfMonth(current);
  const startWeekday = (first.getDay() + 6) % 7; // lunes=0
  const daysInMonth = last.getDate();
  const grid: CalendarDay[] = [];
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(first);
    d.setDate(first.getDate() - (startWeekday - i));
    grid.push({ date: d, inMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(current.getFullYear(), current.getMonth(), i);
    grid.push({ date: d, inMonth: true });
  }
  while (grid.length < 42) {
    const lastDate = grid[grid.length - 1].date;
    const d = new Date(lastDate);
    d.setDate(lastDate.getDate() + 1);
    grid.push({ date: d, inMonth: false });
  }
  return grid;
}

export default function Admin({ onNewRoute, onGoEmployees, onGoVehicles }: Props) {
  const { token, user } = useAuth();

  // --- State top-level (orden fijo) ---
  const [search, setSearch] = useState("");
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const [monthCursor, setMonthCursor] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [detailRoute, setDetailRoute] = useState<RouteItem | null>(null);

  const [files, setFiles] = useState<RouteFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // --- Efectos top-level ---
  // Cargar rutas al iniciar / cambiar token
  useEffect(() => {
    (async () => {
      const data = await apiFetch<RouteItem[]>("/routes", { token });
      setRoutes(data);
    })();
  }, [token]);

  // Cargar ficheros cuando hay ruta en detalle
  useEffect(() => {
    const load = async () => {
      if (!detailRoute?.id) {
        setFiles([]);
        return;
      }
      const list = await apiFetch<RouteFile[]>(`/routes/${detailRoute.id}/files`, { token });
      setFiles(list);
    };
    load();
  }, [detailRoute?.id, token]);

  // --- Derivados ---
  const isRouteCompleted = (r: RouteItem) => {
    // @ts-ignore backend moderno
    if (r.status && typeof r.status === "string") return r.status.toUpperCase() === "COMPLETED";
    // @ts-ignore
    if (r.completedAt) return true;
    return new Date(r.start).getTime() < Date.now() - 2 * 60 * 60 * 1000;
  };

  const filtered = useMemo(() => {
    const byText = routes.filter((r) =>
      `${r.code} ${r.driver} ${r.vehicle}`.toLowerCase().includes(search.toLowerCase())
    );
    return byText.filter((r) => (showCompleted ? isRouteCompleted(r) : !isRouteCompleted(r)));
  }, [routes, search, showCompleted]);

  const routesByDay = useMemo(() => {
    const map = new Map<string, RouteItem[]>();
    for (const r of filtered) {
      const dayKey = new Date(r.start).toDateString();
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(r);
    }
    return map;
  }, [filtered]);

  const monthGrid = useMemo(() => getMonthGrid(monthCursor), [monthCursor]);
  const selectedDayKey = selectedDate.toDateString();
  const dayRoutes = routesByDay.get(selectedDayKey) || [];

  // --- Handlers top-level ---
  const goPrevMonth = () => { const d = new Date(monthCursor); d.setMonth(d.getMonth() - 1); setMonthCursor(d); };
  const goNextMonth = () => { const d = new Date(monthCursor); d.setMonth(d.getMonth() + 1); setMonthCursor(d); };

  const onUpload = async (
    type: "invoice" | "receipt" | "other",
    input: HTMLInputElement,
    routeId: number
  ) => {
    const fl = input.files ? Array.from(input.files) : [];
    if (!fl.length) return;
    setUploading(true);
    try {
      await apiUpload(`/routes/${routeId}/files`, fl, { token, query: { type } });
      const list = await apiFetch<RouteFile[]>(`/routes/${routeId}/files`, { token });
      setFiles(list);
      input.value = "";
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (routeId: number, fileId: number) => {
    if (!confirm("¿Eliminar fichero?")) return;
    try {
      await apiDelete(`/routes/${routeId}/files/${fileId}`, token);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deleteRoute = async (routeId: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta ruta?")) return;
    try {
      await apiDelete(`/routes/${routeId}`, token);
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
      setDetailRoute(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ---------- Render Detalle (sin hooks dentro) ----------
  if (detailRoute) {
    const rid = detailRoute.id as number;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setDetailRoute(null)}>
            ← Volver
          </Button>
          <Button variant="destructive" onClick={() => deleteRoute(rid)}>
            <Trash2 className="h-4 w-4" /> Eliminar ruta
          </Button>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Ruta {detailRoute.code}{" "}
              <Badge variant={isRouteCompleted(detailRoute) ? "secondary" : "outline"}>
                {isRouteCompleted(detailRoute) ? "Realizada" : "Pendiente"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Empresa #{user?.companyId} · Conductor: {detailRoute.driver} · Vehículo: {detailRoute.vehicle} · Salida: {formatTime(detailRoute.start)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Paradas */}
            <div>
              <div className="font-medium mb-2">Paradas</div>
              <div className="space-y-2">
                {detailRoute.stops?.map((s: Stop, idx: number) => (
                  <div key={idx} className="border rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">#{idx + 1} · {s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.eta ? formatTime(s.eta as any) : "—"}</div>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {s.address}
                    </div>
                    {s.notes && <div className="text-sm mt-1">Notas: {s.notes}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Archivos */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Facturas de entrega
                  </CardTitle>
                  <CardDescription>Sube PDF/imagen como comprobante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => onUpload("invoice", e.currentTarget, rid)}
                    disabled={uploading}
                  />
                  <div className="space-y-2">
                    {files.filter((f) => f.type === "INVOICE").map((f) => {
                      const href = f.url.startsWith("http") ? f.url : `${apiBase}${f.url}`;
                      return (
                        <div key={f.id} className="flex items-center justify-between border rounded-lg p-2">
                          <a className="text-sm underline" href={href} target="_blank" rel="noreferrer">
                            {f.originalName}
                          </a>
                          <Button size="sm" variant="outline" onClick={() => deleteFile(rid, f.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    {files.filter((f) => f.type === "INVOICE").length === 0 && (
                      <div className="text-sm text-muted-foreground">Sin facturas</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> Tickets gasolina/comida
                  </CardTitle>
                  <CardDescription>Sube uno o varios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => onUpload("receipt", e.currentTarget, rid)}
                    disabled={uploading}
                  />
                  <div className="space-y-2">
                    {files.filter((f) => f.type === "RECEIPT").map((f) => {
                      const href = f.url.startsWith("http") ? f.url : `${apiBase}${f.url}`;
                      return (
                        <div key={f.id} className="flex items-center justify-between border rounded-lg p-2">
                          <a className="text-sm underline" href={href} target="_blank" rel="noreferrer">
                            {f.originalName}
                          </a>
                          <Button size="sm" variant="outline" onClick={() => deleteFile(rid, f.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    {files.filter((f) => f.type === "RECEIPT").length === 0 && (
                      <div className="text-sm text-muted-foreground">Sin tickets</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Render Calendario + lista del día ----------
  const monthLabel = monthCursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Calendario de rutas</h2>
          <div className="text-xs text-muted-foreground">Empresa #{user?.companyId} · {user?.email}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onGoVehicles}>Vehículos</Button>
          <Button variant="secondary" onClick={onGoEmployees}>Empleados</Button>
          <Button onClick={onNewRoute}><Plus className="h-4 w-4" /> Nueva ruta</Button>
        </div>
      </div>

      {/* Controles calendario */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { const d = new Date(monthCursor); d.setMonth(d.getMonth() - 1); setMonthCursor(d); }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setMonthCursor(new Date()); setSelectedDate(new Date()); }}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={() => { const d = new Date(monthCursor); d.setMonth(d.getMonth() + 1); setMonthCursor(d); }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant={showCompleted ? "default" : "outline"} size="sm" onClick={() => setShowCompleted((v) => !v)}>
                {showCompleted ? "Viendo realizadas" : "Ver realizadas"}
              </Button>
            </div>
          </div>
          <CardDescription>Haz clic en un día para ver sus rutas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map(({ date, inMonth }, idx) => {
              const key = date.toDateString();
              const dayNum = date.getDate();
              const dayList = routesByDay.get(key) || [];
              const completedCount = dayList.filter(isRouteCompleted).length;
              const pendingCount = dayList.length - completedCount;
              const isSel = sameDay(date, selectedDate);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-lg p-2 min-h-[64px] text-left border
                    ${inMonth ? "" : "opacity-40"}
                    ${isSel ? "border-black" : "border-gray-200 hover:border-gray-300"}
                  `}
                >
                  <div className="text-xs font-medium mb-1">{dayNum}</div>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: Math.min(pendingCount, 3) }).map((_, i) => (
                      <span key={`p-${i}`} className="inline-block w-2.5 h-2.5 rounded-full border border-blue-500" />
                    ))}
                    {Array.from({ length: Math.min(completedCount, 3) }).map((_, i) => (
                      <span key={`c-${i}`} className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                    ))}
                    {dayList.length > 6 && (
                      <span className="text-[10px] text-muted-foreground">+{dayList.length - 6}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Buscador */}
      <div>
        <Input
          placeholder="Buscar por código, conductor o vehículo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista del día */}
      <div className="grid md:grid-cols-2 gap-4">
        {dayRoutes.map((route) => (
          <Card key={route.id} className="rounded-2xl hover:shadow-sm transition">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="secondary">{route.code}</Badge>
                  <span className="font-semibold">{route.driver}</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="rounded-xl" variant="outline">{route.vehicle}</Badge>
                  <Badge variant={isRouteCompleted(route) ? "secondary" : "outline"}>
                    {isRouteCompleted(route) ? "Realizada" : "Pendiente"}
                  </Badge>
                </div>
              </div>
              <CardDescription>Salida: {formatTime(route.start)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {route.stops?.map((s, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border">
                  <div className="pt-1"><Badge variant="secondary">#{idx + 1}</Badge></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {s.address}
                    </div>
                    <div className="text-xs text-muted-foreground">ETA {s.eta ? formatTime(s.eta as any) : "—"}</div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={() => setDetailRoute(route)}>Ver detalle</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!dayRoutes.length && (
          <div className="text-sm text-muted-foreground">No hay rutas para el día seleccionado.</div>
        )}
      </div>
    </div>
  );
}
