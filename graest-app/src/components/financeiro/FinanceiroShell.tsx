"use client";

import { useState } from "react";
import {
  Settings,
  Monitor,
  FlaskConical,
  Users,
  UserMinus,
  Briefcase,
  Package,
  BookOpen,
  Calendar,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { FinConfigTab } from "./FinConfigTab";
import { FinEquipamentosTab } from "./FinEquipamentosTab";
import { FinLaboratoriosTab } from "./FinLaboratoriosTab";
import { FinRhDiretoTab } from "./FinRhDiretoTab";
import { FinRhIndiretoTab } from "./FinRhIndiretoTab";
import { FinServicosTerceirosTab } from "./FinServicosTerceirosTab";
import { FinMaterialConsumoTab } from "./FinMaterialConsumoTab";
import { FinOutrosTab } from "./FinOutrosTab";
import { FinCronogramaTab } from "./FinCronogramaTab";
import { FinResumoTab } from "./FinResumoTab";

const TABS = [
  { id: "config", label: "Configurações", icon: Settings },
  { id: "equipamentos", label: "I - Equipamentos", icon: Monitor },
  { id: "laboratorios", label: "II - Laboratórios", icon: FlaskConical },
  { id: "rhDireto", label: "III - RH Direto", icon: Users },
  { id: "rhIndireto", label: "III - RH Indireto", icon: UserMinus },
  { id: "servicosTerceiros", label: "IV - Serv. Terceiros", icon: Briefcase },
  { id: "materialConsumo", label: "V - Mat. Consumo", icon: Package },
  { id: "outros", label: "VI - Outros", icon: BookOpen },
  { id: "cronograma", label: "Cronograma Financeiro", icon: Calendar },
  { id: "resumo", label: "Resumo Orçamentário", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function FinanceiroShell() {
  const [activeTab, setActiveTab] = useState<TabId>("config");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <nav className={`shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-850 flex flex-col transition-all duration-200 ${
        sidebarCollapsed ? "w-12" : "w-56"
      }`}>
        <div className="flex-1 overflow-y-auto py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={sidebarCollapsed ? tab.label : undefined}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                  isActive
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium border-r-2 border-green-600"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-800"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
              </button>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center rounded-md p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
            title={sidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "config" && <FinConfigTab />}
        {activeTab === "equipamentos" && <FinEquipamentosTab />}
        {activeTab === "laboratorios" && <FinLaboratoriosTab />}
        {activeTab === "rhDireto" && <FinRhDiretoTab />}
        {activeTab === "rhIndireto" && <FinRhIndiretoTab />}
        {activeTab === "servicosTerceiros" && <FinServicosTerceirosTab />}
        {activeTab === "materialConsumo" && <FinMaterialConsumoTab />}
        {activeTab === "outros" && <FinOutrosTab />}
        {activeTab === "cronograma" && <FinCronogramaTab />}
        {activeTab === "resumo" && <FinResumoTab />}
      </div>
    </div>
  );
}
