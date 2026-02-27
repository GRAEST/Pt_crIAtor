"use client";

import { cn } from "@/lib/utils";
import { WIZARD_SECTIONS } from "@/lib/constants";
import { usePlanStore } from "@/lib/store";
import { Check, Paperclip, FileSpreadsheet, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";

interface WizardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function WizardSidebar({ collapsed = false, onToggle }: WizardSidebarProps) {
  const { currentStep, setStep, completedSections } = usePlanStore();

  return (
    <aside className={cn(
      "shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-850 flex flex-col transition-all duration-200",
      collapsed ? "w-12" : "w-72"
    )}>
      <div className={cn(
        "sticky top-14 flex-1 overflow-y-auto",
        collapsed ? "p-1.5" : "p-4"
      )}>
        {!collapsed && (
          <>
            {/* Materials link */}
            <Link
              href={`/plans/${usePlanStore.getState().planId}/materials`}
              className="mb-4 flex items-center gap-2 rounded-lg border border-accent-200 dark:border-accent-800/50 bg-accent-50 dark:bg-accent-950/30 px-3 py-2.5 text-sm font-medium text-accent-700 dark:text-accent-300 hover:bg-accent-100 dark:hover:bg-accent-950/50 transition-colors"
            >
              <Paperclip size={16} />
              Materiais de Contexto
            </Link>

            {/* Financeiro link */}
            <Link
              href={`/plans/${usePlanStore.getState().planId}/financeiro`}
              className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/30 px-3 py-2.5 text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
            >
              <FileSpreadsheet size={16} />
              Financeiro
            </Link>

            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Seções do Plano
            </h2>
          </>
        )}

        {collapsed && (
          <div className="flex flex-col items-center gap-1 mb-2">
            <Link
              href={`/plans/${usePlanStore.getState().planId}/materials`}
              title="Materiais de Contexto"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-colors"
            >
              <Paperclip size={16} />
            </Link>
            <Link
              href={`/plans/${usePlanStore.getState().planId}/financeiro`}
              title="Financeiro"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
            >
              <FileSpreadsheet size={16} />
            </Link>
            <div className="my-1 w-6 border-t border-gray-200 dark:border-gray-700" />
          </div>
        )}

        <nav className={collapsed ? "flex flex-col items-center gap-1" : "space-y-1"}>
          {WIZARD_SECTIONS.map((section, index) => {
            const isActive = currentStep === index;
            const isCompleted = completedSections.includes(section.number);

            return (
              <button
                key={section.number}
                onClick={() => setStep(index)}
                title={collapsed ? section.title : undefined}
                className={cn(
                  "flex items-center text-left text-sm transition-colors",
                  collapsed
                    ? "h-8 w-8 justify-center rounded-lg"
                    : "w-full gap-3 rounded-lg px-3 py-2.5",
                  isActive
                    ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    isActive
                      ? "bg-primary-600 text-white"
                      : isCompleted
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  )}
                >
                  {isCompleted ? <Check size={14} /> : section.number}
                </span>
                {!collapsed && <span className="truncate">{section.title}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Toggle button at bottom */}
      <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center rounded-md p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
          title={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
    </aside>
  );
}
