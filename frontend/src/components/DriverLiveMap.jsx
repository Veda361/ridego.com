"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import RecenterMap from "./RecenterMap";

// Custom driver icon definition
const getDriverIcon = () => {
  if (typeof window === "undefined") return null;
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div class="relative flex items-center justify-center w-10 h-10">
             <div class="absolute w-8 h-8 rounded-full bg-red-500/20 animate-pulse"></div>
             <div class="w-7 h-7 rounded-full bg-[#111112] border border-brand-red/60 shadow-[0_0_15px_rgba(255,51,51,0.5)] flex items-center justify-center">
               <span class="text-xs">🚗</span>
             </div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export default function DriverLiveMap({
  driverLocation,
}) {
  if (!driverLocation) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Waiting for GPS...
      </div>
    );
  }

  const customIcon = getDriverIcon();

  return (
    <div className="h-full w-full overflow-hidden rounded-3xl relative">
      <MapContainer
        center={[
          driverLocation.lat,
          driverLocation.lng,
        ]}
        zoom={16}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <RecenterMap
          position={[
            driverLocation.lat,
            driverLocation.lng,
          ]}
        />

        {customIcon && (
          <Marker
            position={[
              driverLocation.lat,
              driverLocation.lng,
            ]}
            icon={customIcon}
          >
            <Popup>
              <span className="text-black font-semibold">🚗 Your Current Location</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}