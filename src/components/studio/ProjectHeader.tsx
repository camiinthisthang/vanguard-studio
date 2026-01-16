"use client";

import { Save, Plus, Pencil, Check, X } from "lucide-react";
import { useState } from "react";

interface ProjectHeaderProps {
  projectName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onNew: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function ProjectHeader({
  projectName,
  onNameChange,
  onSave,
  onNew,
  isSaving = false,
  lastSaved,
}: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);

  const handleStartEdit = () => {
    setEditValue(projectName);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onNameChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(projectName);
    setIsEditing(false);
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      {/* Project Name */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="px-2 py-1 text-lg font-semibold border border-violet-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Check size={18} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-gray-800">{projectName}</h1>
            <button
              onClick={handleStartEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Pencil size={14} />
            </button>
          </>
        )}

        {lastSaved && (
          <span className="text-xs text-gray-400 ml-2">
            Saved {formatLastSaved(lastSaved)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600
                     hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Plus size={16} />
          New
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-violet-600
                     hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
