import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NewRouteForm({ onCreated }) {
  const [driver, setDriver] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [stops, setStops] = useState([{ name: "", address: "", notes: "" }]);
  const [loading, setLoading] = useState(false);

  const addStop = () =>
    setStops((prev) => [...prev, { name: "", address: "", notes: "" }]);

  const updateStop = (i, key, value) =>
    setStops((prev) =>
      prev.map((s, idx) => (i === idx ? { ...s, [key]: value } : s))
    );

  const createRoute = async () => {
    setLoading(true);
    const newRoute = {
      id: crypto.randomUUID(),
      driver,
      vehicle,
      start: new Date().toISOString(),
      stops,
    };

    const { error } = await supabase.from("routes").insert([newRoute]);
    setLoading(false);

    if (error) {
      alert("Error al crear ruta: " + error.message);
    } else {
      onCreated && onCreated(newRoute);
      setDriver("");
      setVehicle("");
      setStops([{ name: "", address: "", notes: "" }]);
    }
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Nueva ruta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Conductor"
          value={driver}
          onChange={(e) => setDriver(e.target.value)}
          className="rounded-2xl"
        />
        <Input
          placeholder="Vehículo"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className="rounded-2xl"
        />
        {stops.map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Cliente"
              value={s.name}
              onChange={(e) => updateStop(i, "name", e.target.value)}
            />
            <Input
              placeholder="Dirección"
              value={s.address}
              onChange={(e) => updateStop(i, "address", e.target.value)}
            />
            <Input
              placeholder="Notas"
              value={s.notes}
              onChange={(e) => updateStop(i, "notes", e.target.value)}
            />
          </div>
        ))}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={addStop}>
            <Plus className="h-4 w-4" /> Añadir parada
          </Button>
          <Button onClick={createRoute} disabled={loading}>
            <Send className="h-4 w-4" /> {loading ? "Creando..." : "Crear ruta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
