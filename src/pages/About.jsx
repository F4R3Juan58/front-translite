import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SectionTitle from "@/components/SectionTitle";
import { Truck, CalendarClock, Map as MapRoute } from "lucide-react";

export default function About() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Propuesta de valor</CardTitle>
          <CardDescription>
            App sencilla y económica para que las microempresas de transporte gestionen rutas y entregas sin complicaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <SectionTitle icon={MapRoute} title="Rutas optimizadas" subtitle="Crea rutas con paradas ordenadas en minutos." />
            <SectionTitle icon={Truck} title="Seguimiento simple" subtitle="Marca entregas hechas con foto y firma." />
            <SectionTitle icon={CalendarClock} title="Tiempo real" subtitle="Panel web con estado al instante." />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
