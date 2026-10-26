"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  X,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
    exact: false,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    exact: false,
  },
];

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
}) => {
  const pathname = usePathname();

  // Close mobile navigation drawer on route change
  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  // Handle ESC key for mobile drawer
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onMobileClose]);

  const isLinkActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-border">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-ring rounded-md py-1"
          aria-label="TaskFlow Dashboard Home"
        >
          <div className="size-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center p-1.5 shrink-0 text-accent">
            <svg
              className="size-full"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="2" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.75" />
              <rect x="5" y="7" width="17" height="14" rx="2.5" fill="#202020" stroke="currentColor" strokeWidth="1.75" />
              <path d="M9 14.5L12 17.5L18 10.5" stroke="#72C7A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-text-primary">
              TaskFlow
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted -mt-0.5">
              Dashboard
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={onMobileClose}
          className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors focus-ring"
          aria-label="Close navigation"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-text-muted">
          Workspace
        </div>
        {navItems.map((item) => {
          const active = isLinkActive(item);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus-ring ${
                active
                  ? "bg-accent/15 text-accent border border-accent/25 shadow-xs font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <IconComponent
                className={`size-4.5 shrink-0 transition-colors ${
                  active ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
                }`}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Environment Tag */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-elevated/70 border border-border-subtle">
          <div className="size-2 rounded-full bg-[#72C7A5] shrink-0" aria-hidden="true" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-text-primary truncate">
              Neon PostgreSQL
            </span>
            <span className="text-[10px] text-text-muted truncate">
              Connected Layer
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw] z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
