import { Plus } from "lucide-react";
import SearchBar from "./SearchBar";
import NewRouteButton from "./NewRouteButton";
import RouteCard from "./RouteCard";

export default function AdminPanel({ routes, search, setSearch, onNewRoute }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Panel de rutas</h2>
        <NewRouteButton onClick={onNewRoute}>
          <Plus className="h-4 w-4" /> Nueva ruta
        </NewRouteButton>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <div className="grid md:grid-cols-2 gap-4">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
