import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

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

  useEffect(() => {
    if (chart && containerRef.current) {
      // Clear previous
      containerRef.current.innerHTML = '';
      
      try {
        mermaid.render('mermaid-svg-' + Math.random().toString(36).substr(2, 9), chart).then((result) => {
          containerRef.current.innerHTML = result.svg;
        }).catch(err => {
          console.error('Mermaid render error', err);
          containerRef.current.innerHTML = `<div class="text-red-500 text-sm p-4 bg-red-50 border border-red-200 rounded">Failed to render diagram: ${err.message}</div>`;
        });
      } catch (err) {
        console.error('Mermaid syntax error', err);
        containerRef.current.innerHTML = `<div class="text-red-500 text-sm p-4 bg-red-50 border border-red-200 rounded">Syntax error in diagram</div>`;
      }
    }
  }, [chart]);

  if (!chart) return null;

  return (
    <div className="w-full flex justify-center p-4 bg-white rounded-lg border border-slate-200 overflow-auto">
      <div ref={containerRef} className="mermaid" />
    </div>
  );
}
