"use client";

import React, { useState, useCallback, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMobileClose = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handleMobileToggle = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-text-primary">
      {/* Persistent Desktop Sidebar and Collapsible Mobile Drawer */}
      <Suspense fallback={<aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-surface border-r border-border" />}>
        <Sidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={handleMobileClose}
        />
      </Suspense>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Suspense fallback={<header className="h-16 border-b border-border bg-surface/80" />}>
          <Header onMobileMenuToggle={handleMobileToggle} />
        </Suspense>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
