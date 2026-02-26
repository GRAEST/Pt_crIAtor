"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export interface MermaidDiagramHandle {
  getElement: () => HTMLDivElement | null;
}

export const MermaidDiagram = forwardRef<MermaidDiagramHandle, MermaidDiagramProps>(
  function MermaidDiagram({ chart, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const renderIdRef = useRef(0);

    useImperativeHandle(ref, () => ({
      getElement: () => containerRef.current,
    }));

    useEffect(() => {
      if (!chart || !containerRef.current) return;

      const currentId = ++renderIdRef.current;

      (async () => {
        // Dynamic import to avoid SSR issues
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
            nodeSpacing: 50,
            rankSpacing: 60,
            padding: 20,
          },
          themeVariables: {
            primaryColor: "#dbeafe",
            primaryBorderColor: "#3b82f6",
            primaryTextColor: "#1e293b",
            lineColor: "#334155",
            secondaryColor: "#fef3c7",
            secondaryBorderColor: "#f59e0b",
            secondaryTextColor: "#1e293b",
            tertiaryColor: "#fce7f3",
            tertiaryBorderColor: "#ec4899",
            tertiaryTextColor: "#1e293b",
            nodeBorder: "#3b82f6",
            mainBkg: "#dbeafe",
            nodeTextColor: "#1e293b",
            textColor: "#1e293b",
            titleColor: "#1e293b",
            edgeLabelBackground: "#ffffff",
            clusterBkg: "transparent",
            clusterBorder: "transparent",
            fontSize: "14px",
          },
        });

        // Check if this render is still current
        if (currentId !== renderIdRef.current || !containerRef.current) return;

        const id = `mermaid-${Date.now()}`;
        try {
          const { svg } = await mermaid.render(id, chart);
          if (currentId === renderIdRef.current && containerRef.current) {
            containerRef.current.innerHTML = svg;

            // Inject a <style> tag into the SVG to force dark text colors.
            // This is more reliable than inline styles for html-to-image capture,
            // because foreignObject HTML content inherits from <style> in the SVG.
            const svgEl = containerRef.current.querySelector("svg");
            if (svgEl) {
              const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
              styleEl.textContent = `
                text, tspan { fill: #1e293b !important; }
                .nodeLabel, .edgeLabel, .label,
                foreignObject span, foreignObject p, foreignObject div {
                  color: #1e293b !important;
                  fill: #1e293b !important;
                }
                .flowchart-link, path.path, .edge-pattern-dotted {
                  stroke: #334155 !important;
                  stroke-width: 2px !important;
                }
                marker path {
                  fill: #334155 !important;
                  stroke: #334155 !important;
                }
                .cluster rect {
                  fill: transparent !important;
                  stroke: transparent !important;
                }
                .cluster span {
                  color: #1e293b !important;
                }
                .cluster .nodeLabel {
                  color: #1e293b !important;
                }
              `;
              svgEl.prepend(styleEl);
            }
          }
        } catch (err) {
          console.error("Mermaid render error:", err);
          if (currentId === renderIdRef.current && containerRef.current) {
            containerRef.current.innerHTML = `<p style="color:red;font-size:12px">Erro ao renderizar diagrama</p>`;
          }
        }
      })();
    }, [chart]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{ backgroundColor: "#ffffff", padding: "16px" }}
      />
    );
  }
);
