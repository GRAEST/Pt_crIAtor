"use client";

import { useState, useCallback, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { usePlanStore } from "@/lib/store";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { SnippetPicker } from "@/components/editor/SnippetPicker";
import { ExampleViewer } from "@/components/editor/ExampleViewer";
import { EapTreeEditor, replaceEapPlaceholder } from "@/components/eap/EapTreeEditor";
import { ModuleDiagramGenerator, ArchitectureDiagramGenerator, replaceModulePlaceholder, replaceArchitecturePlaceholder, extractMermaidFromResponse, extractArchitectureFromResponse } from "@/components/mermaid/ModuleDiagramGenerator";
import { aiTextToHtml, jsonContentToText } from "@/lib/utils";
import type { JSONContent, Editor } from "@tiptap/react";

interface SnippetData {
  id: string;
  name: string;
  content: JSONContent;
}

/**
 * Find all [Inserir Snippet: X] placeholders in the editor and replace them
 * with actual snippet content from the database.
 */
function replaceSnippetPlaceholders(editor: Editor, snippets: SnippetData[]): number {
  let replacedCount = 0;

  // Process one snippet at a time (doc changes after each replacement)
  for (const snippet of snippets) {
    let found = false;

    editor.state.doc.descendants((node, pos) => {
      if (found) return false;
      if (!node.isText || !node.text) return true;

      // Match [Inserir Snippet: SnippetName] — case insensitive on the tag, exact on name
      const regex = new RegExp(`\\[Inserir Snippet:\\s*${escapeRegex(snippet.name)}\\s*\\]`, "i");
      if (!regex.test(node.text)) return true;

      // Find parent paragraph boundaries
      const resolved = editor.state.doc.resolve(pos);
      const parentStart = resolved.before(resolved.depth);
      const parentEnd = resolved.after(resolved.depth);

      // Build the snippet content as HTML-like nodes for TipTap insertion
      const snippetNodes = snippet.content?.content ?? [];

      // Replace the placeholder paragraph with the snippet content
      editor
        .chain()
        .focus()
        .setTextSelection({ from: parentStart, to: parentEnd })
        .deleteSelection()
        .insertContent(snippet.content)
        .run();

      found = true;
      replacedCount++;
      return false;
    });
  }

  return replacedCount;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function Step06Escopo() {
  const { formData, updateField } = usePlanStore();
  const [escopoEditor, setEscopoEditor] = useState<Editor | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [architectureCode, setArchitectureCode] = useState<string | null>(null);
  const captureEapRef = useRef<(() => Promise<string | null>) | null>(null);
  const captureModuleDiagramRef = useRef<(() => Promise<string | null>) | null>(null);
  const captureArchitectureRef = useRef<(() => Promise<string | null>) | null>(null);

  const handleEditorReady = useCallback((editor: Editor) => {
    setEscopoEditor(editor);
  }, []);

  const handleSnippetInsert = (fieldName: string) => (snippetContent: JSONContent) => {
    const current = formData[fieldName as keyof typeof formData] as JSONContent | null;
    const currentChildren = current?.content ?? [];
    const snippetChildren = snippetContent?.content ?? [];
    updateField(fieldName as any, {
      type: "doc",
      content: [...currentChildren, ...snippetChildren],
    });
  };

  const handleAiGenerate = async () => {
    if (aiLoading || !escopoEditor) return;
    setAiLoading(true);

    try {
      const planId = usePlanStore.getState().planId;
      const currentContent = escopoEditor.state.doc.textContent;
      const motivacaoText = jsonContentToText(formData.motivacao);
      const objetivosGeraisText = jsonContentToText(formData.objetivosGerais);
      const objetivosEspText = jsonContentToText(formData.objetivosEspecificos);

      // Extract module names from objetivos específicos (format: "- Módulo de X:")
      const moduleNames: string[] = [];
      if (formData.useModulosApproach && objetivosEspText) {
        const moduleRegex = /[-•]\s*(Módulo\s+de\s+[^:\n]+)/gi;
        let match;
        while ((match = moduleRegex.exec(objetivosEspText)) !== null) {
          moduleNames.push(match[1].trim());
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectContext: Record<string, any> = {
        projectName: formData.projectName,
        projectNickname: formData.projectNickname,
        partnerName: formData.partnerName,
        motivacao: motivacaoText?.slice(0, 2000),
        objetivosGerais: objetivosGeraisText?.slice(0, 1000),
        objetivosEspecificos: objetivosEspText?.slice(0, 1000),
        moduleNames: moduleNames.length > 0 ? moduleNames : undefined,
      };

      if (formData.activities?.length > 0) {
        projectContext.activities = formData.activities.map((a) => ({
          name: a.name,
          description: a.description,
          subActivities: a.subActivities?.map((s) => s.name).filter(Boolean) ?? [],
        }));
      }

      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          section: 6,
          fieldName: "escopo",
          currentContent,
          action: "generate",
          useModulosApproach: formData.useModulosApproach,
          projectContext,
        }),
      });

      const data = await res.json();
      if (res.ok && data.suggestion) {
        // Extract Mermaid diagram code from AI response (if present)
        let { mermaidCode: extractedMermaid, cleanText } = extractMermaidFromResponse(data.suggestion);

        // Insert AI text into editor (without the Mermaid block)
        escopoEditor.chain().focus().insertContent(aiTextToHtml(cleanText)).run();

        // If AI didn't include a Mermaid block but we have module names, generate it separately
        if (!extractedMermaid && moduleNames.length > 0) {
          try {
            const mermaidRes = await fetch("/api/ai/suggest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                planId,
                section: 6,
                fieldName: "mermaidDiagram",
                currentContent: "",
                action: "generate",
                projectContext: {
                  projectName: formData.projectName,
                  projectNickname: formData.projectNickname,
                  moduleNames,
                },
              }),
            });
            const mermaidData = await mermaidRes.json();
            if (mermaidRes.ok && mermaidData.suggestion) {
              const extracted = extractMermaidFromResponse(mermaidData.suggestion);
              if (extracted.mermaidCode) {
                extractedMermaid = extracted.mermaidCode;
              }
            }
          } catch (err) {
            console.error("Separate Mermaid generation error:", err);
          }
        }

        // If Mermaid code was found, render it and replace the placeholder
        if (extractedMermaid) {
          setMermaidCode(extractedMermaid);

          // Wait for Mermaid to render, then capture and replace placeholder
          setTimeout(async () => {
            const hasPlaceholder = escopoEditor.state.doc.textContent.match(/\[Inserir Figura:.*[Mm][oó]dulo.*\]/i);
            const hasCapture = !!captureModuleDiagramRef.current;
            console.log(`[Mermaid] Attempting capture: hasCapture=${hasCapture}, hasPlaceholder=${!!hasPlaceholder}`);

            if (captureModuleDiagramRef.current && hasPlaceholder) {
              try {
                const moduleUrl = await captureModuleDiagramRef.current();
                console.log(`[Mermaid] Captured image: ${moduleUrl ? "success" : "null"}`);
                if (moduleUrl) {
                  const replaced = replaceModulePlaceholder(escopoEditor, moduleUrl);
                  console.log(`[Mermaid] Placeholder replaced: ${replaced}`);
                }
              } catch (err) {
                console.error("Auto module diagram capture error:", err);
              }
            }
          }, 2000); // Wait for Mermaid rendering
        }

        // Generate architecture diagram if placeholder exists
        const hasArchPlaceholder = escopoEditor.state.doc.textContent.match(/\[Inserir Figura:.*[Aa]rquitetura.*\]/i);
        if (hasArchPlaceholder) {
          try {
            const archRes = await fetch("/api/ai/suggest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                planId,
                section: 6,
                fieldName: "architectureDiagram",
                currentContent: "",
                action: "generate",
                projectContext: {
                  projectName: formData.projectName,
                  projectNickname: formData.projectNickname,
                  motivacao: motivacaoText?.slice(0, 1000),
                  objetivosGerais: objetivosGeraisText?.slice(0, 500),
                  objetivosEspecificos: objetivosEspText?.slice(0, 1000),
                  moduleNames: moduleNames.length > 0 ? moduleNames : undefined,
                },
              }),
            });
            const archData = await archRes.json();
            if (archRes.ok && archData.suggestion) {
              const extracted = extractArchitectureFromResponse(archData.suggestion);
              if (extracted.htmlCode) {
                setArchitectureCode(extracted.htmlCode);

                // Wait for HTML to render, then capture and replace placeholder
                setTimeout(async () => {
                  if (captureArchitectureRef.current) {
                    try {
                      const archUrl = await captureArchitectureRef.current();
                      console.log(`[Architecture] Captured image: ${archUrl ? "success" : "null"}`);
                      if (archUrl) {
                        const replaced = replaceArchitecturePlaceholder(escopoEditor, archUrl);
                        console.log(`[Architecture] Placeholder replaced: ${replaced}`);
                      }
                    } catch (err) {
                      console.error("Auto architecture diagram capture error:", err);
                    }
                  }
                }, 2500);
              }
            }
          } catch (err) {
            console.error("Architecture diagram generation error:", err);
          }
        }

        // Auto-replace [Inserir Figura: ...EAP...] placeholder with actual EAP image
        if (escopoEditor.state.doc.textContent.includes("[Inserir Figura:") && captureEapRef.current) {
          try {
            const eapUrl = await captureEapRef.current();
            if (eapUrl) {
              replaceEapPlaceholder(escopoEditor, eapUrl);
            }
          } catch (err) {
            console.error("Auto EAP capture error:", err);
          }
        }

        // Auto-replace [Inserir Snippet: X] placeholders with actual snippet content
        if (escopoEditor.state.doc.textContent.includes("[Inserir Snippet:")) {
          try {
            const snippetsRes = await fetch("/api/snippets?section=6");
            if (snippetsRes.ok) {
              const snippets: SnippetData[] = await snippetsRes.json();
              if (snippets.length > 0) {
                replaceSnippetPlaceholders(escopoEditor, snippets);
              }
            }
          } catch (err) {
            console.error("Auto snippet insertion error:", err);
          }
        }
      }
    } catch (err) {
      console.error("AI escopo generation error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">6. Escopo</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Descreva COMO o projeto será feito: etapas, módulos, metodologia,
        ferramentas, linguagens.
      </p>

      {/* EAP Tree Editor */}
      <EapTreeEditor escopoEditor={escopoEditor} captureRef={captureEapRef} />

      {/* Module Diagram (shown after AI generates Mermaid code) */}
      <ModuleDiagramGenerator
        mermaidCode={mermaidCode}
        captureRef={captureModuleDiagramRef}
      />

      {/* Architecture Diagram (shown after AI generates architecture HTML) */}
      <ArchitectureDiagramGenerator
        htmlCode={architectureCode}
        captureRef={captureArchitectureRef}
      />

      <RichTextEditor
        section={6}
        fieldName="escopo"
        content={formData.escopo}
        onChange={(content) => updateField("escopo", content)}
        placeholder="Descreva o escopo do projeto..."
        onEditorReady={handleEditorReady}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAiGenerate}
          disabled={aiLoading || !escopoEditor}
          className="flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {aiLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {aiLoading ? "Gerando escopo..." : "Gerar Escopo com IA"}
        </button>
        <SnippetPicker sectionNumber={6} onInsert={handleSnippetInsert("escopo")} />
        <ExampleViewer sectionNumber={6} />
      </div>
    </div>
  );
}
