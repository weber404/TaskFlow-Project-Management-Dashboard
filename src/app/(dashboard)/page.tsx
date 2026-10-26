import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time project and task overview and performance metrics."
      />

      <DashboardContent />
    </div>
  );
}
