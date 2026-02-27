"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";

export interface StaffOption {
  id?: string;
  staffMemberId?: string;
  name: string;
  roleInProject?: string;
}

interface Props {
  value: string;
  staffMemberId?: string;
  options: StaffOption[];
  onChange: (option: StaffOption) => void;
  onCreateNew: (name: string) => Promise<StaffOption>;
  placeholder?: string;
}

export function StaffCombobox({
  value,
  staffMemberId,
  options,
  onChange,
  onCreateNew,
  placeholder = "Buscar profissional...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? options.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const exactMatch = options.some(
    (s) => s.name.toLowerCase() === search.trim().toLowerCase()
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(
    (option: StaffOption) => {
      onChange(option);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  const handleCreate = useCallback(async () => {
    const name = search.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const newOption = await onCreateNew(name);
      onChange(newOption);
      setOpen(false);
      setSearch("");
    } finally {
      setCreating(false);
    }
  }, [search, creating, onCreateNew, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length === 1) {
        handleSelect(filtered[0]);
      } else if (search.trim() && !exactMatch) {
        handleCreate();
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center gap-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 cursor-text"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {!open && value ? (
          <div className="flex-1 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 truncate">
            {value}
          </div>
        ) : (
          <div className="flex items-center flex-1 gap-1 px-2 py-1">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={open ? search : ""}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={value || placeholder}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none placeholder-gray-400"
            />
          </div>
        )}
        <ChevronDown
          size={14}
          className={`shrink-0 mr-2 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 shadow-lg overflow-hidden">
          <ul className="max-h-[132px] overflow-y-auto">
            {filtered.length === 0 && !search.trim() && (
              <li className="px-3 py-2 text-xs text-gray-400">
                Nenhum profissional no plano
              </li>
            )}
            {filtered.length === 0 && search.trim() && !creating && (
              <li
                onClick={handleCreate}
                className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
              >
                <Plus size={14} />
                Criar &quot;{search.trim()}&quot;
              </li>
            )}
            {filtered.map((option, i) => (
              <li
                key={option.staffMemberId || option.name + i}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  option.staffMemberId && option.staffMemberId === staffMemberId
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700"
                }`}
              >
                <div className="font-medium">{option.name}</div>
                {option.roleInProject && (
                  <div className="text-xs text-gray-400 truncate">{option.roleInProject}</div>
                )}
              </li>
            ))}
            {search.trim() && !exactMatch && filtered.length > 0 && (
              <li
                onClick={handleCreate}
                className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer border-t border-gray-100 dark:border-gray-700"
              >
                <Plus size={14} />
                Criar &quot;{search.trim()}&quot;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
