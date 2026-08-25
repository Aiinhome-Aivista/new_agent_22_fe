import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  themeVariables: {
    primaryColor: '#eef2ff', // Indigo 50
    primaryTextColor: '#3730a3', // Indigo 800
    primaryBorderColor: '#a5b4fc', // Indigo 300
    lineColor: '#94a3b8', // Slate 400
    secondaryColor: '#f0fdf4', // Green 50
    tertiaryColor: '#fef2f2', // Red 50
    nodeBorder: '#c7d2fe', // Indigo 200
    clusterBkg: '#f8fafc', // Slate 50
    clusterBorder: '#e2e8f0', // Slate 200
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px'
  }
});

export default function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const zoomedContainerRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [svgContent, setSvgContent] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (chart && containerRef.current) {
      containerRef.current.innerHTML = '';
      
      try {
        const uniqueId = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
        mermaid.render(uniqueId, chart).then((result) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = result.svg;
          }
          setSvgContent(result.svg);
        }).catch(err => {
          console.error('Mermaid render error', err);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="text-red-500 text-sm p-4 bg-red-50 border border-red-200 rounded">Failed to render diagram: ${err.message}</div>`;
          }
        });
      } catch (err) {
        console.error('Mermaid syntax error', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-red-500 text-sm p-4 bg-red-50 border border-red-200 rounded">Syntax error in diagram</div>`;
        }
      }
    }
  }, [chart]);

  useEffect(() => {
    if (isZoomed && svgContent && zoomedContainerRef.current) {
      zoomedContainerRef.current.innerHTML = svgContent;
    }
  }, [isZoomed, svgContent]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  const handleOpenZoom = () => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(true);
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoomScale(prev => Math.min(prev + 0.25, 3.5));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoomScale(prev => Math.max(prev - 0.25, 0.4));
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(prev + 0.15, 3.5));
    } else {
      setZoomScale(prev => Math.max(prev - 0.15, 0.4));
    }
  };

  if (!chart) return null;

  return (
    <>
      {/* Normal View Card */}
      <div className="relative group w-full bg-slate-50 rounded-xl border border-slate-200 shadow-inner p-4 overflow-hidden">
        {/* Click to Zoom Overlay Button Banner */}
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Architecture Topology Diagram
          </span>
          <button 
            onClick={handleOpenZoom}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-orange-50 text-sidebar hover:text-primary-orange border border-gray-200 hover:border-primary-orange rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Expand to Fullscreen / Zoom"
          >
            <MagnifyingGlassPlusIcon className="w-3.5 h-3.5 text-primary-orange" />
            <span>Click to Zoom</span>
          </button>
        </div>

        {/* Diagram Area */}
        <div className="w-full flex justify-center p-2 rounded-lg">
          <div 
            ref={containerRef} 
            className="mermaid w-full flex justify-center [&>svg]:w-full [&>svg]:max-w-4xl [&>svg]:h-auto transition-all duration-300" 
          />
        </div>
      </div>

      {/* Expanded Fullscreen Zoom Modal (Clean Light Theme) */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex flex-col p-3 sm:p-6 animate-fade-in select-none"
          onClick={() => setIsZoomed(false)}
        >
          {/* Modal Header Bar */}
          <div 
            className="flex items-center justify-between bg-white text-sidebar px-6 py-3.5 rounded-t-2xl border border-gray-200 border-b-gray-100 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-200 text-primary-orange flex items-center justify-center font-bold">
                🔍
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-sidebar">
                  Architecture Diagram — Interactive Zoom & Pan
                </h3>
                <p className="text-[11px] text-gray-500">
                  Drag with mouse to move/pan • Scroll wheel or + / - to zoom in & out
                </p>
              </div>
            </div>

            {/* Right Side: Zoom Controls (+ / -) & Cross Close Button */}
            <div className="flex items-center gap-3">
              {/* Interactive Zoom (+ / - / Reset) Controls */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
                <button 
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 0.4}
                  className="p-1.5 text-gray-600 hover:text-primary-orange hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <MagnifyingGlassMinusIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleResetZoom}
                  className="px-2 py-0.5 text-xs font-mono font-bold text-gray-700 hover:bg-white rounded-md transition-all cursor-pointer flex items-center gap-1"
                  title="Reset Zoom & Position"
                >
                  <ArrowsPointingOutIcon className="w-3 h-3 text-primary-orange" />
                  <span>{Math.round(zoomScale * 100)}%</span>
                </button>
                <button 
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 3.5}
                  className="p-1.5 text-gray-600 hover:text-primary-orange hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  title="Zoom In (+)"
                >
                  <MagnifyingGlassPlusIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Top Right Cross (✕) Close Button */}
              <button 
                onClick={() => setIsZoomed(false)}
                className="p-2 text-gray-500 hover:text-white bg-gray-100 hover:bg-red-600 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Close Fullscreen View (Esc)"
              >
                <XMarkIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Modal Body Container with Interactive Mouse Drag & Pan (Clean Light Theme) */}
          <div 
            className="flex-1 bg-white rounded-b-2xl overflow-hidden flex items-center justify-center shadow-2xl relative cursor-grab active:cursor-grabbing border border-t-0 border-gray-200"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div 
              ref={zoomedContainerRef} 
              style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale})`, 
                transformOrigin: 'center center', 
                transition: isDragging ? 'none' : 'transform 0.15s ease-out' 
              }}
              className="mermaid min-w-full flex items-center justify-center p-8 [&>svg]:w-full [&>svg]:max-w-none [&>svg]:h-auto pointer-events-none"
            />
          </div>
        </div>
      )}
    </>
  );
}
