import React, { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TasksList } from "@/components/tasks/TasksList";
import { Spinner } from "@/components/ui/Spinner";

export const metadata = {
  title: "Tasks — TaskFlow",
  description: "Unified task tracking across projects with status workflow and filtering.",
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Unified task tracking across projects with status workflow and execution tracking."
      />

      <Suspense
        fallback={
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Spinner size="lg" label="Loading tasks..." />
          </div>
        }
      >
        <TasksList />
      </Suspense>
    </div>
  );
}
