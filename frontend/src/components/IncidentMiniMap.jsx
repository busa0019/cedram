import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function IncidentMiniMap({ lat, lng, title, subtitle }) {
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-surface shadow-sm h-[340px]">
      <MapContainer
        center={[lat, lng]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>
            <strong>{title}</strong>
            <br />
            {subtitle}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}