"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function RecenterMap({
  position,
  zoom = 16,
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView(position, zoom, {
      animate: true,
    });
  }, [position, zoom, map]);

  return null;
}