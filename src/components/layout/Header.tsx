"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const pathname = usePathname();

  // Determine breadcrumb / section from pathname
  let sectionName = "Dashboard";
  if (pathname.startsWith("/projects")) {
    sectionName = "Projects";
  } else if (pathname.startsWith("/tasks")) {
    sectionName = "Tasks";
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors focus-ring cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm">
          <Link
            href="/"
            className="text-text-muted hover:text-text-secondary transition-colors focus-ring rounded-sm"
          >
            TaskFlow
          </Link>
          <ChevronRight className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span className="font-medium text-text-primary">
            {sectionName}
          </span>
        </nav>
      </div>

      {/* Right side: Workspace indicator label */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-xs text-text-secondary">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
          <span className="font-medium text-text-primary">Production Workspace</span>
        </div>
      </div>
    </header>
  );
};
