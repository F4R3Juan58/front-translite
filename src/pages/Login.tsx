import React, { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

type LoginResponse = { token: string; user: User };

export default function Login({ onLoggedIn }: { onLoggedIn?: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password }
      });
      login(data.token, data.user);
      onLoggedIn?.();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Acceder a TransLite</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
            <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Contraseña" required />
            {err && <div className="text-sm text-red-600">{err}</div>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Entrando..." : "Entrar"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
