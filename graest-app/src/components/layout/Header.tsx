"use client";

import Link from "next/link";
import Image from "next/image";
import { FileText, Puzzle, LayoutDashboard } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo-full.png" alt="Graest" width={120} height={36} className="h-8 w-auto drop-shadow-sm" priority />
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavLink href="/plans" icon={<FileText size={18} />} label="Planos" />
          <NavLink href="/snippets" icon={<Puzzle size={18} />} label="Snippets" />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
    >
      {icon}
      {label}
    </Link>
  );
}
