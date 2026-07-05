"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper component to center map on coordinates
function AutoCenter({ driverLocation, pickupLocation }) {
  const map = useMap();
  const previousPosition = useRef(null);

  useEffect(() => {
    if (!driverLocation) {
      if (pickupLocation) {
        map.setView([pickupLocation.lat, pickupLocation.lng], 15, {
          animate: true,
        });
      }
      return;
    }

    const current = L.latLng(driverLocation.lat, driverLocation.lng);

    if (!previousPosition.current) {
      previousPosition.current = current;

      map.setView([driverLocation.lat, driverLocation.lng], 16, {
        animate: true,
      });

      return;
    }

    const distance = previousPosition.current.distanceTo(current);

    // Only move camera if driver moved more than 10 meters
    if (distance > 10) {
      previousPosition.current = current;

      map.setView([driverLocation.lat, driverLocation.lng], map.getZoom(), {
        animate: true,
      });
    }
  }, [driverLocation, pickupLocation, map]);

  return null;
}

// Custom markers generator
const getCustomIcons = () => {
  if (typeof window === "undefined") return { pickupIcon: null, destinationIcon: null, driverIcon: null };

  const pickupIcon = L.divIcon({
    className: "custom-div-icon",
    html: `<div class="relative flex items-center justify-center w-8 h-8">
             <div class="absolute w-6 h-6 rounded-full bg-red-500/30 animate-ping"></div>
             <div class="w-4 h-4 rounded-full bg-brand-red border-2 border-white shadow-[0_0_10px_rgba(255,51,51,0.5)]"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const destinationIcon = L.divIcon({
    className: "custom-div-icon",
    html: `<div class="relative flex items-center justify-center w-8 h-8">
             <div class="absolute w-6 h-6 rounded-full bg-emerald-500/30 animate-ping"></div>
             <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const driverIcon = L.divIcon({
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

  return { pickupIcon, destinationIcon, driverIcon };
};

export default function LiveRideMap({
  pickupLocation,
  destinationLocation,
  driverLocation,
  route = [],
}) {
  const center = useMemo(() => {
    if (driverLocation) {
      return [driverLocation.lat, driverLocation.lng];
    }

    if (pickupLocation) {
      return [pickupLocation.lat, pickupLocation.lng];
    }

    return [20.5937, 78.9629];
  }, [driverLocation, pickupLocation]);

  const { pickupIcon, destinationIcon, driverIcon } = getCustomIcons();

  return (
    <div className="h-full w-full overflow-hidden rounded-3xl relative">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        zoomControl={true}
        className="h-full w-full"
      >
        <AutoCenter
          driverLocation={driverLocation}
          pickupLocation={pickupLocation}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Pickup */}
        {pickupLocation && pickupIcon && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-black font-semibold">
                <span className="text-brand-red">📍 Pickup Location</span>
                <br />
                <span className="text-xs text-slate-600 font-medium">{pickupLocation.address}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination */}
        {destinationLocation && destinationIcon && (
          <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={destinationIcon}>
            <Popup>
              <div className="text-black font-semibold">
                <span className="text-emerald-500">🏁 Destination Location</span>
                <br />
                <span className="text-xs text-slate-600 font-medium">{destinationLocation.address}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver */}
        {driverLocation && driverIcon && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>
              <span className="text-black font-semibold">🚗 Driver is here</span>
            </Popup>
          </Marker>
        )}

        {/* Glowing Route Polyline */}
        {route.length > 0 && (
          <>
            {/* Outer Glow Line */}
            <Polyline
              positions={route}
              pathOptions={{
                color: "#ff3333",
                weight: 10,
                opacity: 0.3,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Inner Neon Core Line */}
            <Polyline
              positions={route}
              pathOptions={{
                color: "#ff3333",
                weight: 5,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
