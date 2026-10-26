"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProjectWithTaskCount } from "@/types";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
  project: ProjectWithTaskCount | null;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  project,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!project) return null;

  const taskCount = project._count?.tasks ?? 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete project");
      }

      onSuccess(project.id);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) {
          setError(null);
          onClose();
        }
      }}
      title="Delete Project"
      maxWidth="sm"
      footer={
        <>
          <Button
            type="button"
            variant="SECONDARY"
            size="SM"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="DANGER"
            size="SM"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Project
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="size-4 shrink-0 text-danger mt-0.5" aria-hidden="true" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center shrink-0 text-danger">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              Are you sure you want to delete <span className="font-semibold text-text-primary">“{project.title}”</span>?
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              This action is permanent and cannot be undone.{" "}
              {taskCount > 0 ? (
                <span className="text-danger font-medium">
                  All {taskCount} associated task{taskCount === 1 ? "" : "s"} will also be permanently deleted.
                </span>
              ) : (
                "This project has no associated tasks."
              )}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
