import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/profile";
import { hospitalsNear, crowdColor } from "@/lib/geo";
import { AmbulanceIcon, Clock, Heart, MapPin } from "lucide-react";

export function NearbyHospitals() {
  const profile = useProfile((s) => s.profile);
  const favorites = useProfile((s) => s.favorites);
  const toggleFavorite = useProfile((s) => s.toggleFavorite);
  if (!profile) return null;
  const near = hospitalsNear({ lat: profile.lat, lng: profile.lng }, 5);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Nearby hospitals</h3>
          <p className="text-xs text-muted-foreground">From {profile.city}</p>
        </div>
        <Link to="/hospitals" className="text-xs text-primary hover:underline">See all</Link>
      </div>
      <div className="mt-3 space-y-2">
        {near.map((h) => {
          const fav = favorites.includes(h.id);
          return (
            <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/40">
              <button onClick={() => toggleFavorite(h.id)} className="rounded-full size-8 grid place-items-center hover:bg-accent">
                <Heart className={`size-4 ${fav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
              <div className="min-w-0 flex-1">
                <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }} className="font-medium text-sm truncate block hover:text-primary">{h.name}</Link>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{h.distanceKm.toFixed(1)} km</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" />{h.etaMins}m</span>
                  {h.emergency24x7 && <span className="inline-flex items-center gap-1 text-destructive"><AmbulanceIcon className="size-3" />ER</span>}
                </div>
              </div>
              <div className={`text-[10px] px-2 py-1 rounded-full border ${crowdColor(h.queueLoad)} whitespace-nowrap`}>
                {h.queueLoad === "low" ? "Low" : h.queueLoad === "medium" ? "Med" : "High"} crowd
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
