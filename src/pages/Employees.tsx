import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Employee, Role } from "@/types";
import { PencilLine, Trash2, Check, X } from "lucide-react";

type FormState = {
  name: string;
  surname: string;
  license: string;
  notes: string;
  email: string;
  password: string; // para alta (obligatorio), para edición será opcional
  role: Role;
};

const emptyForm: FormState = {
  name: "",
  surname: "",
  license: "",
  notes: "",
  email: "",
  password: "",
  role: "driver",
};

export default function Employees() {
  const { token } = useAuth();
  const [list, setList] = useState<Employee[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);

  // Edición inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await apiFetch<Employee[]>("/employees", { token });
    setList(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!form.name || !form.surname || !form.email || !form.password) {
      return alert("Faltan campos obligatorios: nombre, apellidos, email, contraseña.");
    }
    setLoading(true);
    try {
      await apiFetch("/employees", { method: "POST", token, body: form });
      setForm(emptyForm);
      await load();
    } catch (e: any) {
      alert(e?.message || "Error creando empleado");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEdit({
      name: emp.name,
      surname: emp.surname,
      license: emp.license || "",
      notes: emp.notes || "",
      email: emp.email,
      role: emp.role as Role,
      password: "", // opcional en edición
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEdit({});
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    if (!edit.name || !edit.surname || !edit.email) {
      return alert("Nombre, apellidos y email son obligatorios.");
    }
    setSaving(true);
    try {
      // Enviar solo los campos presentes
      const payload: any = {
        name: edit.name,
        surname: edit.surname,
        email: edit.email,
        license: edit.license ?? "",
        notes: edit.notes ?? "",
        role: edit.role ?? "driver",
      };
      if (edit.password && edit.password.length >= 6) {
        payload.password = edit.password;
      }
      await apiFetch(`/employees/${editingId}`, {
        method: "PATCH",
        token,
        body: payload,
      });
      cancelEdit();
      await load();
    } catch (e: any) {
      alert(e?.message || "Error actualizando empleado");
    } finally {
      setSaving(false);
    }
  };

  const removeEmp = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este empleado?")) return;
    try {
      await apiFetch(`/employees/${id}`, { method: "DELETE", token });
      await load();
    } catch (e: any) {
      alert(e?.message || "Error eliminando empleado");
    }
  };

  // Separar por rol
  const admins = useMemo(() => list.filter((e) => e.role === "admin"), [list]);
  const drivers = useMemo(() => list.filter((e) => e.role === "driver"), [list]);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Alta */}
      <Card className="rounded-2xl md:col-span-1">
        <CardHeader>
          <CardTitle>Nuevo empleado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Apellidos"
            value={form.surname}
            onChange={(e) => setForm({ ...form, surname: e.target.value })}
          />
          <Input
            placeholder="Carnets (B,C+E)"
            value={form.license}
            onChange={(e) => setForm({ ...form, license: e.target.value })}
          />
          <Input
            placeholder="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Contraseña (min 6)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className="border rounded-xl px-3 py-2 w-full"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          >
            <option value="driver">Conductor</option>
            <option value="admin">Administrador</option>
          </select>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </CardContent>
      </Card>

      {/* Listado separado por rol */}
      <div className="md:col-span-2 space-y-4">
        {/* Administradores */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Administradores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {admins.map((emp) => {
              const rowEditing = editingId === emp.id;
              return (
                <div
                  key={emp.id}
                  className="border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  {!rowEditing ? (
                    <>
                      <div>
                        <div className="font-medium">
                          {emp.name} {emp.surname}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {emp.email} · Carnets: {emp.license || "—"} · Rol: {emp.role}
                          {emp.notes ? ` · Notas: ${emp.notes}` : ""}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(emp)}>
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeEmp(emp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-3 gap-2 w-full sm:max-w-3xl">
                        <Input
                          placeholder="Nombre"
                          value={edit.name ?? ""}
                          onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                        />
                        <Input
                          placeholder="Apellidos"
                          value={edit.surname ?? ""}
                          onChange={(e) => setEdit({ ...edit, surname: e.target.value })}
                        />
                        <Input
                          type="email"
                          placeholder="Email"
                          value={edit.email ?? ""}
                          onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                        />
                        <Input
                          placeholder="Carnets (B,C+E)"
                          value={edit.license ?? ""}
                          onChange={(e) => setEdit({ ...edit, license: e.target.value })}
                        />
                        <Input
                          placeholder="Notas"
                          value={edit.notes ?? ""}
                          onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
                        />
                        <select
                          className="border rounded-xl px-3 py-2 w-full"
                          value={edit.role ?? "admin"}
                          onChange={(e) => setEdit({ ...edit, role: e.target.value as Role })}
                        >
                          <option value="driver">Conductor</option>
                          <option value="admin">Administrador</option>
                        </select>
                        <Input
                          type="password"
                          placeholder="Nueva contraseña (opcional)"
                          value={edit.password ?? ""}
                          onChange={(e) => setEdit({ ...edit, password: e.target.value })}
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
            {!admins.length && (
              <div className="text-sm text-muted-foreground">Sin administradores</div>
            )}
          </CardContent>
        </Card>

        {/* Conductores */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Conductores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {drivers.map((emp) => {
              const rowEditing = editingId === emp.id;
              return (
                <div
                  key={emp.id}
                  className="border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  {!rowEditing ? (
                    <>
                      <div>
                        <div className="font-medium">
                          {emp.name} {emp.surname}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {emp.email} · Carnets: {emp.license || "—"} · Rol: {emp.role}
                          {emp.notes ? ` · Notas: ${emp.notes}` : ""}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(emp)}>
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeEmp(emp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-3 gap-2 w-full sm:max-w-3xl">
                        <Input
                          placeholder="Nombre"
                          value={edit.name ?? ""}
                          onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                        />
                        <Input
                          placeholder="Apellidos"
                          value={edit.surname ?? ""}
                          onChange={(e) => setEdit({ ...edit, surname: e.target.value })}
                        />
                        <Input
                          type="email"
                          placeholder="Email"
                          value={edit.email ?? ""}
                          onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                        />
                        <Input
                          placeholder="Carnets (B,C+E)"
                          value={edit.license ?? ""}
                          onChange={(e) => setEdit({ ...edit, license: e.target.value })}
                        />
                        <Input
                          placeholder="Notas"
                          value={edit.notes ?? ""}
                          onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
                        />
                        <select
                          className="border rounded-xl px-3 py-2 w-full"
                          value={edit.role ?? "driver"}
                          onChange={(e) => setEdit({ ...edit, role: e.target.value as Role })}
                        >
                          <option value="driver">Conductor</option>
                          <option value="admin">Administrador</option>
                        </select>
                        <Input
                          type="password"
                          placeholder="Nueva contraseña (opcional)"
                          value={edit.password ?? ""}
                          onChange={(e) => setEdit({ ...edit, password: e.target.value })}
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
            {!drivers.length && (
              <div className="text-sm text-muted-foreground">Sin conductores</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
