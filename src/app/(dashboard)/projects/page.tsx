import React, { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { Spinner } from "@/components/ui/Spinner";

export const metadata = {
  title: "Projects — TaskFlow",
  description: "Manage, track, and filter all workspace projects and timelines.",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage, track, and filter all company projects and execution milestones."
      />

      <Suspense
        fallback={
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Spinner size="lg" label="Loading projects..." />
          </div>
        }
      >
        <ProjectsList />
      </Suspense>
    </div>
  );
}

