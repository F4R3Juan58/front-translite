import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/types";
import { Trash2, PencilLine, Check, X } from "lucide-react";

// Helpers: separar/combinar Marca + Modelo dentro del campo "model"
function splitBrandModel(fullModel: string): { brand: string; model: string } {
  const trimmed = (fullModel || "").trim();
  if (!trimmed) return { brand: "", model: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { brand: parts[0], model: "" };
  return { brand: parts[0], model: parts.slice(1).join(" ") };
}
function joinBrandModel(brand: string, model: string) {
  return [brand.trim(), model.trim()].filter(Boolean).join(" ");
}

export default function Vehicles() {
  const { token } = useAuth();
  const [list, setList] = useState<Vehicle[]>([]);

  // Alta
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [creating, setCreating] = useState(false);

  // Edición inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editPlate, setEditPlate] = useState("");
  const [saving, setSaving] = useState(false);

  // Carga
  const [loading, setLoading] = useState(true);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Vehicle[]>("/vehicles", { token });
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!brand.trim() || !model.trim() || !plate.trim()) {
      alert("Faltan campos: Marca, Modelo o Matrícula");
      return;
    }
    setCreating(true);
    try {
      await apiFetch("/vehicles", {
        method: "POST",
        token,
        body: { model: joinBrandModel(brand, model), plate },
      });
      setBrand("");
      setModel("");
      setPlate("");
      await load();
    } catch (e: any) {
      alert(e?.message || "Error creando vehículo");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (v: Vehicle) => {
    setEditingId(v.id);
    const parsed = splitBrandModel(v.model);
    setEditBrand(parsed.brand);
    setEditModel(parsed.model);
    setEditPlate(v.plate);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBrand("");
    setEditModel("");
    setEditPlate("");
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    if (!editBrand.trim() || !editModel.trim() || !editPlate.trim()) {
      alert("Faltan campos: Marca, Modelo o Matrícula");
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/vehicles/${editingId}`, {
        method: "PATCH",
        token,
        body: {
          model: joinBrandModel(editBrand, editModel),
          plate: editPlate,
        },
      });
      cancelEdit();
      await load();
    } catch (e: any) {
      alert(e?.message || "Error actualizando vehículo");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este vehículo?")) return;
    try {
      await apiFetch(`/vehicles/${id}`, { method: "DELETE", token });
      await load();
    } catch (e: any) {
      alert(e?.message || "Error eliminando vehículo");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Alta */}
      <Card className="rounded-2xl md:col-span-1">
        <CardHeader>
          <CardTitle>Nuevo vehículo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Marca (p. ej., Ford)"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
          <Input
            placeholder="Modelo (p. ej., Transit)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <Input
            placeholder="Matrícula (p. ej., 4587KZT)"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
          />
          <Button onClick={submit} disabled={creating}>
            {creating ? "Guardando..." : "Guardar"}
          </Button>
        </CardContent>
      </Card>

      {/* Listado y edición */}
      <Card className="rounded-2xl md:col-span-2">
        <CardHeader>
          <CardTitle>Vehículos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <div className="text-sm text-muted-foreground">Cargando...</div>}

          {!loading && list.map((v) => {
            const parsed = splitBrandModel(v.model);
            const rowEditing = editingId === v.id;

            return (
              <div
                key={v.id}
                className="border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                {!rowEditing ? (
                  <>
                    <div>
                      <div className="font-medium">
                        {parsed.brand || "—"}{" "}
                        <span className="text-muted-foreground">{parsed.model}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Matrícula: {v.plate}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(v)}>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => remove(v.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-3 gap-2 w-full sm:max-w-2xl">
                      <Input
                        placeholder="Marca"
                        value={editBrand}
                        onChange={(e) => setEditBrand(e.target.value)}
                      />
                      <Input
                        placeholder="Modelo"
                        value={editModel}
                        onChange={(e) => setEditModel(e.target.value)}
                      />
                      <Input
                        placeholder="Matrícula"
                        value={editPlate}
                        onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} size="sm" disabled={saving}>
                        <Check className="h-4 w-4 mr-1" />
                        {saving ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {!loading && !list.length && (
            <div className="text-sm text-muted-foreground">Sin vehículos</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
