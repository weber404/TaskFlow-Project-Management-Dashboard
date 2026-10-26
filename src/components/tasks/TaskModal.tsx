"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TaskStatus, TaskWithProject } from "@/types";
import { AlertCircle } from "lucide-react";

interface ProjectOption {
  id: number;
  title: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (task: TaskWithProject) => void;
  task?: TaskWithProject | null;
  projects: ProjectOption[];
  initialProjectId?: number;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  task,
  projects,
  initialProjectId,
}) => {
  const isEditing = Boolean(task);

  // Initialize state directly from props to avoid cascading renders
  const defaultProjectId = task
    ? String(task.projectId)
    : initialProjectId
    ? String(initialProjectId)
    : projects.length > 0
    ? String(projects[0].id)
    : "";

  const [projectId, setProjectId] = useState<string>(defaultProjectId);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.PENDING);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!projectId || isNaN(Number(projectId)) || Number(projectId) <= 0) {
      newErrors.projectId = "Please select a valid project";
    }

    if (!title.trim()) {
      newErrors.title = "Task title is required";
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
        projectId: Number(projectId),
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        status,
      };

      const url = isEditing && task ? `/api/tasks/${task.id}` : "/api/tasks";
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
        throw new Error(json.error?.message || `Failed to ${isEditing ? "update" : "create"} task`);
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

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.title,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Create New Task"}
      description={
        isEditing
          ? "Update task details, project assignment, or status."
          : "Add a new task associated with an existing workspace project."
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
            form="task-form"
            variant="PRIMARY"
            size="SM"
            isLoading={isSubmitting}
            disabled={projects.length === 0}
          >
            {isEditing ? "Save Changes" : "Create Task"}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {apiError && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="size-4 shrink-0 text-danger mt-0.5" aria-hidden="true" />
            <span className="flex-1">{apiError}</span>
          </div>
        )}

        {/* Project Selector */}
        {projects.length === 0 ? (
          <div
            role="alert"
            className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs flex items-start gap-2"
          >
            <AlertCircle className="size-4 shrink-0 text-warning mt-0.5" aria-hidden="true" />
            <span>
              No projects found. You must create a project before adding tasks.
            </span>
          </div>
        ) : (
          <Select
            label="Associated Project"
            required
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: "" }));
            }}
            error={errors.projectId}
            disabled={isSubmitting}
            options={projectOptions}
          />
        )}

        {/* Task Title */}
        <Input
          label="Task Title"
          required
          placeholder="e.g. Implement user login flow"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          error={errors.title}
          disabled={isSubmitting}
          autoFocus
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Detailed task description and requirements (optional)"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
          }}
          error={errors.description}
          disabled={isSubmitting}
          rows={3}
        />

        {/* Status */}
        <Select
          label="Task Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          disabled={isSubmitting}
          options={[
            { value: TaskStatus.PENDING, label: "Pending" },
            { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
            { value: TaskStatus.COMPLETED, label: "Completed" },
          ]}
        />
      </form>
    </Modal>
  );
};
