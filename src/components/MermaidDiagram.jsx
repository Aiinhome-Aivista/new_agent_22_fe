import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif'
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
