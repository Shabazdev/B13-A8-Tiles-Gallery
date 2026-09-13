import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
        <span className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
          Loading…
        </span>
      </div>
    </div>
  );
}
