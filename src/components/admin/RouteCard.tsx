import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function RouteCard({ route }) {
  const formatTime = (d) =>
    new Date(d).toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <Card className="rounded-2xl hover:shadow-sm transition">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Badge variant="secondary">{route.id}</Badge>
            <span className="font-semibold">{route.driver}</span>
          </CardTitle>
          <Badge className="rounded-xl" variant="outline">
            {route.vehicle}
          </Badge>
        </div>
        <CardDescription>Salida: {formatTime(route.start)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {route.stops?.map((s, idx) => (
          <div
            key={s.id}
            className="flex items-start gap-3 p-3 rounded-xl border"
          >
            <div className="pt-1">
              <Badge variant="secondary">#{idx + 1}</Badge>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{s.name}</div>
              <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {s.address}
              </div>
              <div className="text-xs text-muted-foreground">
                ETA {formatTime(s.eta)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" className="rounded-xl">
                Detalles
              </Button>
              <Button size="sm" className="rounded-xl">
                Enviar al conductor
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
