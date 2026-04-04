'use client';

import React, { useEffect, useRef } from 'react';

interface NeighborhoodMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
}

const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({
  latitude = 34.1899,
  longitude = -118.4514,
  zoom = 11,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create a simple SVG-based map visualization
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 400 300');
    svg.setAttribute('class', 'w-full h-full');

    // Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '400');
    bg.setAttribute('height', '300');
    bg.setAttribute('fill', '#111111');
    svg.appendChild(bg);

    // Grid
    for (let i = 0; i < 400; i += 50) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(i));
      line.setAttribute('y1', '0');
      line.setAttribute('x2', String(i));
      line.setAttribute('y2', '300');
      line.setAttribute('stroke', '#222222');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', '0');
      line2.setAttribute('y1', String(i));
      line2.setAttribute('x2', '400');
      line2.setAttribute('y2', String(i));
      line2.setAttribute('stroke', '#222222');
      line2.setAttribute('stroke-width', '1');
      svg.appendChild(line2);
    }

    // Add sample pins
    const pins = [
      { x: 80, y: 60 },
      { x: 150, y: 100 },
      { x: 200, y: 140 },
      { x: 120, y: 180 },
      { x: 250, y: 120 },
      { x: 300, y: 200 },
    ];

    pins.forEach((pin) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pin.x));
      circle.setAttribute('cy', String(pin.y));
      circle.setAttribute('r', '6');
      circle.setAttribute('fill', '#F59E0B');
      circle.setAttribute('opacity', '0.8');
      svg.appendChild(circle);

      const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      outer.setAttribute('cx', String(pin.x));
      outer.setAttribute('cy', String(pin.y));
      outer.setAttribute('r', '10');
      outer.setAttribute('fill', 'none');
      outer.setAttribute('stroke', '#F59E0B');
      outer.setAttribute('stroke-width', '1');
      outer.setAttribute('opacity', '0.3');
      svg.appendChild(outer);
    });

    // Center pin
    const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    center.setAttribute('cx', '200');
    center.setAttribute('cy', '150');
    center.setAttribute('r', '8');
    center.setAttribute('fill', '#F59E0B');
    svg.appendChild(center);

    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(svg);
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-80 bg-surface rounded-lg border border-border overflow-hidden"
    />
  );
};

export default NeighborhoodMap;
