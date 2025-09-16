import { Input } from "@/components/ui/input";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Input
        placeholder="Buscar por ID, conductor o vehículo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl"
      />
    </div>
  );
}
