import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, Map as MapRoute, Camera, Signature, Phone, Mail, Loader2 } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";

const formatTime = (d) =>
  new Date(d).toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

export default function Driver() {
  const [stops, setStops] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      const { data } = await supabase
        .from("routes")
        .select("*")
        .eq("driver", "Carlos M.") // Filtro de prueba
        .single();
      if (data) {
        setStops(data.stops || []);
        setActive(data.stops?.[0]?.id);
      }
    };
    fetchRoute();
  }, []);

  const current = stops.find((s) => s.id === active);

  const markDelivered = () => {
    setStops((prev) =>
      prev.map((s) => (s.id === active ? { ...s, delivered: true } : s))
    );
  };

  const savePhoto = () => {
    setStops((prev) =>
      prev.map((s) => (s.id === active ? { ...s, photo: "mock-photo" } : s))
    );
  };

  const saveSign = (data) => {
    setStops((prev) =>
      prev.map((s) => (s.id === active ? { ...s, sign: data } : s))
    );
  };

  if (!current) return <p>Cargando...</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-4">
      {/* Lista de paradas */}
      <Card className="rounded-2xl md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Ruta de hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stops.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full text-left p-3 rounded-xl border hover:shadow-sm transition ${
                active === s.id ? "border-black" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">#{idx + 1}</Badge>
                  <div className="font-medium truncate max-w-[150px]">{s.name}</div>
                </div>
                {s.delivered ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <MapRoute className="h-5 w-5" />
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {s.address}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Detalle de parada */}
      <Card className="rounded-2xl md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {current?.name}
          </CardTitle>
          <CardDescription>{current?.address}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 text-sm">
              <div className="text-muted-foreground">ETA</div>
              <div className="font-medium">{formatTime(current?.eta)}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-sm">
              <div className="text-muted-foreground">Contacto</div>
              <div className="font-medium flex items-center gap-2">
                <Phone className="h-3 w-3" /> {current?.contact?.phone}
              </div>
              <div className="text-xs flex items-center gap-2">
                <Mail className="h-3 w-3" /> {current?.contact?.email}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-sm">
              <div className="text-muted-foreground">Notas</div>
              <div className="font-medium">{current?.notes}</div>
            </div>
          </div>

          {/* Foto y firma */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Foto de entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-xl border h-40 grid place-items-center text-sm text-muted-foreground">
                  {current?.photo || "(Placeholder de cámara)"}
                </div>
                <Button size="sm" variant="secondary" onClick={savePhoto} className="rounded-xl">
                  Capturar
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Signature className="h-4 w-4" /> Firma del receptor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SignaturePad value={current?.sign} onChange={saveSign} />
              </CardContent>
            </Card>
          </div>

          {/* Botones */}
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <Button variant="outline" className="rounded-xl gap-2">
              <MapPin className="h-4 w-4" /> Abrir en Maps
            </Button>
            {!current?.delivered ? (
              <Button onClick={markDelivered} className="rounded-xl gap-2">
                <CheckCircle2 className="h-4 w-4" /> Marcar entregado
              </Button>
            ) : (
              <Button disabled className="rounded-xl gap-2" variant="secondary">
                <Loader2 className="h-4 w-4 animate-spin" /> Sincronizado
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
