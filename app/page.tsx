import HomeView from "@/components/HomeView";
import { TILES_DATA } from "@/lib/tiles";

export default function HomePage() {
  return <HomeView featuredTiles={TILES_DATA.slice(0, 4)} />;
}
