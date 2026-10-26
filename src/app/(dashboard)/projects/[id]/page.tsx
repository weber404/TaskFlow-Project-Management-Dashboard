import React, { Suspense } from "react";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { Spinner } from "@/components/ui/Spinner";

export const metadata = {
  title: "Project Details — TaskFlow",
  description: "View project details, timeline, and associated tasks.",
};

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-16 flex flex-col items-center justify-center space-y-4">
          <Spinner size="lg" label="Loading project details..." />
        </div>
      }
    >
      <ProjectDetailLoader params={params} />
    </Suspense>
  );
}

async function ProjectDetailLoader({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}

