import { notFound } from "next/navigation";
import TileDetailsView from "@/components/TileDetailsView";
import { TILES_DATA } from "@/lib/tiles";

export default async function TileDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tile = TILES_DATA.find((t) => t.id === id);

  if (!tile) {
    notFound();
  }

  return <TileDetailsView tile={tile} />;
}
