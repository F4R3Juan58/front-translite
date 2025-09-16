import { Button } from "@/components/ui/button";

export default function NewRouteButton({ onClick, children }) {
  return (
    <Button className="gap-2 rounded-2xl" onClick={onClick}>
      {children}
    </Button>
  );
}
