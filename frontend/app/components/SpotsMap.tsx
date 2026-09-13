"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Spot = {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

const TOKYO: [number, number] = [35.681236, 139.767125];

export default function SpotsMap({ spots }: { spots: Spot[] }) {
  const withCoords = spots.filter(
    (s): s is Spot & { latitude: number; longitude: number } =>
      s.latitude != null && s.longitude != null,
  );
  const center: [number, number] = withCoords.length
    ? [withCoords[0].latitude, withCoords[0].longitude]
    : TOKYO;
  return (
    <MapContainer center={center} zoom={11} style={{ height: 480, borderRadius: 8 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((s) => (
        <Marker key={s.id} position={[s.latitude, s.longitude]}>
          <Popup>
            <Link href={`/spots/${s.id}`}>{s.name}</Link>
            <br />
            {s.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
