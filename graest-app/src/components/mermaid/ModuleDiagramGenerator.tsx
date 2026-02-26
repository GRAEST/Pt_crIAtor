"use client";

import { useEffect, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import type { Editor } from "@tiptap/react";
import { MermaidDiagram } from "./MermaidDiagram";
import type { MermaidDiagramHandle } from "./MermaidDiagram";

/** Generic function to replace a figure placeholder in editor with an image */
function replaceFigurePlaceholder(editor: Editor, imageUrl: string, pattern: RegExp): boolean {
  let replaced = false;
  const doc = editor.state.doc;

  doc.descendants((node, pos) => {
    if (replaced) return false;
    if (node.isText && node.text) {
      if (pattern.test(node.text)) {
        const resolved = editor.state.doc.resolve(pos);
        const parentStart = resolved.before(resolved.depth);
        const parentEnd = resolved.after(resolved.depth);

        editor
          .chain()
          .focus()
          .setTextSelection({ from: parentStart, to: parentEnd })
          .deleteSelection()
          .setImage({ src: imageUrl })
          .run();

        replaced = true;
        return false;
      }
    }
    return true;
  });

  return replaced;
}

/** Replace [Inserir Figura: ...Módulo...] placeholder in editor with an image */
export function replaceModulePlaceholder(editor: Editor, imageUrl: string): boolean {
  return replaceFigurePlaceholder(editor, imageUrl, /\[Inserir Figura:.*[Mm][oó]dulo.*\]/i);
}

/** Replace [Inserir Figura: Arquitetura...] placeholder in editor with an image */
export function replaceArchitecturePlaceholder(editor: Editor, imageUrl: string): boolean {
  return replaceFigurePlaceholder(editor, imageUrl, /\[Inserir Figura:.*[Aa]rquitetura.*\]/i);
}

/** Sanitize Mermaid node labels — replace special chars that break parsing */
function sanitizeMermaidLabels(rawCode: string): string {
  return rawCode.replace(/\[([^\]]*)\]/g, (_match, label: string) => {
    const sanitized = label
      .replace(/\(/g, " - ")
      .replace(/\)/g, "")
      .replace(/"/g, "'");
    return `[${sanitized}]`;
  });
}

/**
 * Extract Mermaid code from AI response text.
 * Looks for [MERMAID_START]...[MERMAID_END] blocks.
 * Returns { mermaidCode, cleanText } where cleanText has the block removed.
 */
export function extractMermaidFromResponse(text: string): {
  mermaidCode: string | null;
  cleanText: string;
} {
  const regex = /\[MERMAID_START\]\s*([\s\S]*?)\s*\[MERMAID_END\]/;
  const match = text.match(regex);

  if (!match) {
    return { mermaidCode: null, cleanText: text };
  }

  const mermaidCode = sanitizeMermaidLabels(match[1].trim());
  const cleanText = text.replace(regex, "").trim();

  return { mermaidCode, cleanText };
}

/**
 * Extract architecture HTML from AI response text.
 * Looks for [ARCHITECTURE_START]...[ARCHITECTURE_END] blocks.
 */
export function extractArchitectureFromResponse(text: string): {
  htmlCode: string | null;
  cleanText: string;
} {
  const regex = /\[ARCHITECTURE_START\]\s*([\s\S]*?)\s*\[ARCHITECTURE_END\]/;
  const match = text.match(regex);

  if (!match) {
    return { htmlCode: null, cleanText: text };
  }

  const htmlCode = match[1].trim();
  const cleanText = text.replace(regex, "").trim();

  return { htmlCode, cleanText };
}

interface ModuleDiagramGeneratorProps {
  mermaidCode: string | null;
  /** Ref that parent can use to trigger capture → returns uploaded image URL */
  captureRef?: React.MutableRefObject<(() => Promise<string | null>) | null>;
}

export function ModuleDiagramGenerator({ mermaidCode, captureRef }: ModuleDiagramGeneratorProps) {
  const diagramRef = useRef<MermaidDiagramHandle>(null);

  const captureDiagram = useCallback(async (): Promise<string | null> => {
    const el = diagramRef.current?.getElement();
    if (!el) return null;

    // Wait a bit for Mermaid to finish rendering
    await new Promise((r) => setTimeout(r, 500));

    const dataUrl = await toPng(el, {
      backgroundColor: "#ffffff",
      pixelRatio: 4,
    });

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "module-diagram.png", { type: "image/png" });

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });

    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url;
  }, []);

  // Expose capture function to parent via ref
  useEffect(() => {
    if (captureRef) {
      captureRef.current = captureDiagram;
    }
    return () => {
      if (captureRef) captureRef.current = null;
    };
  }, [captureRef, captureDiagram]);

  if (!mermaidCode) return null;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Diagrama de Módulos (preview)
      </label>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white">
        <MermaidDiagram ref={diagramRef} chart={mermaidCode} />
      </div>
    </div>
  );
}

interface ArchitectureDiagramGeneratorProps {
  htmlCode: string | null;
  captureRef?: React.MutableRefObject<(() => Promise<string | null>) | null>;
}

export function ArchitectureDiagramGenerator({ htmlCode, captureRef }: ArchitectureDiagramGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const captureDiagram = useCallback(async (): Promise<string | null> => {
    const el = containerRef.current;
    if (!el) return null;

    await new Promise((r) => setTimeout(r, 500));

    const dataUrl = await toPng(el, {
      backgroundColor: "#1e293b",
      pixelRatio: 4,
    });

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "architecture-diagram.png", { type: "image/png" });

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });

    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url;
  }, []);

  useEffect(() => {
    if (captureRef) {
      captureRef.current = captureDiagram;
    }
    return () => {
      if (captureRef) captureRef.current = null;
    };
  }, [captureRef, captureDiagram]);

  if (!htmlCode) return null;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Arquitetura da Solução (preview)
      </label>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: htmlCode }}
          style={{ padding: "24px", backgroundColor: "#1e293b" }}
        />
      </div>
    </div>
  );
}
