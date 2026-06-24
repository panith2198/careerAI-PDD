import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Remove01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import CareerNode from './CareerNode';

export default function CareerGraph({ path = [], careersList = [] }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.8));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag canvas handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('select')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Coordinates calculation
  const nodeWidth = 240;
  const nodeHeight = 125;
  const spacingX = 340;

  const getCoords = (index) => {
    const x = index * spacingX + 80;
    const y = 140 + (index % 2 === 0 ? -30 : 30);
    return { x, y };
  };

  // Find slug for a career title in careersList
  const getSlugByTitle = (title) => {
    const c = careersList.find((item) => item.title.toLowerCase() === title.toLowerCase());
    return c ? c.slug : '';
  };

  const getDifficulty = (index) => {
    if (index === 0) return 'easy';
    if (index === path.length - 1) return 'hard';
    return 'medium';
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing backdrop-blur-3xl select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Sci-Fi Grid Pattern backing */}
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      />

      {/* SVG Canvas and Node Layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: path.length * spacingX + 200,
          height: '100%',
        }}
      >
        <svg className="absolute inset-0 size-full pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="violetGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" opacity="0.3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Draw connecting bezier edges */}
          {path.map((role, i) => {
            if (i === path.length - 1) return null;
            const from = getCoords(i);
            const to = getCoords(i + 1);

            const startX = from.x + nodeWidth;
            const startY = from.y + nodeHeight / 2;
            const endX = to.x;
            const endY = to.y + nodeHeight / 2;

            const cp1X = startX + 100;
            const cp1Y = startY;
            const cp2X = endX - 100;
            const cp2Y = endY;

            const d = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

            return (
              <g key={`edge-${i}`}>
                {/* Glowing thick background connector */}
                <path d={d} stroke="rgba(139, 92, 246, 0.15)" strokeWidth="6" fill="transparent" filter="url(#glow)" />
                {/* Main gradient connector */}
                <path d={d} stroke="url(#violetGradient)" strokeWidth="2.5" fill="transparent" />
                {/* Flowing particle neon animation */}
                <motion.path
                  d={d}
                  stroke="#22D3EE"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                  animate={{ strokeDashoffset: [0, -40] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {path.map((role, i) => {
          const coords = getCoords(i);
          const isCurrent = i === 0;
          const isTarget = i === path.length - 1;
          const slug = getSlugByTitle(role);

          return (
            <CareerNode
              key={`node-${role}-${i}`}
              title={role}
              isCurrent={isCurrent}
              isTarget={isTarget}
              x={coords.x}
              y={coords.y}
              slug={slug}
              skillsCount={isCurrent ? 6 : isTarget ? 15 : 10}
              difficulty={getDifficulty(i)}
            />
          );
        })}
      </div>

      {/* Floating Zoom / Pan Controls HUD */}
      <div className="absolute bottom-5 right-5 flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl z-20 shadow-2xl">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/5 hover:bg-white/15 border border-white/5 rounded-xl text-white transition-all cursor-pointer"
          title="Zoom In"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/5 hover:bg-white/15 border border-white/5 rounded-xl text-white transition-all cursor-pointer"
          title="Zoom Out"
        >
          <HugeiconsIcon icon={Remove01Icon} className="size-4" />
        </button>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <button
          onClick={handleReset}
          className="p-2 bg-white/5 hover:bg-white/15 border border-white/5 rounded-xl text-white transition-all cursor-pointer"
          title="Reset View"
        >
          <HugeiconsIcon icon={RefreshIcon} className="size-4" />
        </button>
      </div>
    </div>
  );
}
