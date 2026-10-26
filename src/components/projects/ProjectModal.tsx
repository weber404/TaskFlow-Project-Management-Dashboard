"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ProjectStatus, ProjectWithTaskCount } from "@/types";
import { formatDateForInput } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: ProjectWithTaskCount) => void;
  project?: ProjectWithTaskCount | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  project,
}) => {
  const isEditing = Boolean(project);

  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status || ProjectStatus.ACTIVE);
  const [deadline, setDeadline] = useState(formatDateForInput(project?.deadline));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Project title is required";
    } else if (title.trim().length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (description && description.trim().length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        status,
        deadline: deadline ? `${deadline}T00:00:00.000Z` : null,
      };

      const url = isEditing && project ? `/api/projects/${project.id}` : "/api/projects";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.error?.details && Array.isArray(json.error.details)) {
          const fieldErrors: Record<string, string> = {};
          for (const d of json.error.details) {
            if (d.path && d.path[0]) {
              fieldErrors[String(d.path[0])] = d.message;
            }
          }
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
        }
        throw new Error(json.error?.message || `Failed to ${isEditing ? "update" : "create"} project`);
      }

      onSuccess(json.data);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Project" : "Create New Project"}
      description={
        isEditing
          ? "Update project attributes, status, and timeline."
          : "Define a new workspace project with status and deadlines."
      }
      maxWidth="md"
      footer={
        <>
          <Button
            type="button"
            variant="SECONDARY"
            size="SM"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="project-form"
            variant="PRIMARY"
            size="SM"
            isLoading={isSubmitting}
          >
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {apiError && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="size-4 shrink-0 text-danger mt-0.5" aria-hidden="true" />
            <span className="flex-1">{apiError}</span>
          </div>
        )}

        <Input
          label="Project Title"
          required
          placeholder="e.g. Website Redesign"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          error={errors.title}
          disabled={isSubmitting}
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Describe project objectives and scope (optional)"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
          }}
          error={errors.description}
          disabled={isSubmitting}
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            disabled={isSubmitting}
            options={[
              { value: ProjectStatus.ACTIVE, label: "Active" },
              { value: ProjectStatus.COMPLETED, label: "Completed" },
              { value: ProjectStatus.ON_HOLD, label: "On Hold" },
            ]}
          />

          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: "" }));
            }}
            error={errors.deadline}
            disabled={isSubmitting}
            helperText="Optional target date"
          />
        </div>
      </form>
    </Modal>
  );
};
