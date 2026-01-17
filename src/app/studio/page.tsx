"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChatPanel } from "@/components/studio/ChatPanel";
import { CodePanel } from "@/components/studio/CodePanel";
import { CanvasPanel } from "@/components/studio/CanvasPanel";
import { ProjectHeader } from "@/components/studio/ProjectHeader";
import {
  Project,
  Message,
  generateId,
  createNewProject,
  saveProject as saveToStorage,
  getProject,
  getCurrentProjectId,
  setCurrentProjectId,
} from "@/lib/storage";

export default function StudioPage() {
  const [project, setProject] = useState<Project>(createNewProject);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previousCode, setPreviousCode] = useState<string | undefined>(undefined);
  const canvasRef = useRef<HTMLIFrameElement>(null);

  // Load project from localStorage on mount
  useEffect(() => {
    const currentId = getCurrentProjectId();
    if (currentId) {
      const saved = getProject(currentId);
      if (saved) {
        setProject(saved);
        setLastSaved(new Date(saved.updatedAt));
        return;
      }
    }
    // No saved project, create new one and set as current
    const newProject = createNewProject();
    setProject(newProject);
    setCurrentProjectId(newProject.id);
  }, []);

  // Save project to storage
  const saveProject = useCallback(() => {
    saveToStorage(project);
    setCurrentProjectId(project.id);
    setLastSaved(new Date());
  }, [project]);

  // Auto-save when project changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (project.messages.length > 0 || project.currentCode) {
        saveProject();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [project, saveProject]);

  // Handle sending a message to the AI
  const handleSendMessage = async (prompt: string) => {
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: prompt,
    };

    setProject((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = project.messages.map((m) => ({
        role: m.role,
        content: m.role === "assistant" && m.code
          ? `${m.content}\n\nCODE:\n${m.code}`
          : m.content,
      }));

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          conversationHistory,
          currentCode: project.currentCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate code");
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.explanation,
        code: data.code,
      };

      // Track previous code for diff highlighting (only when AI generates new code)
      if (data.code) {
        setPreviousCode(project.currentCode);
      }

      setProject((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        currentCode: data.code || prev.currentCode,
      }));
    } catch (error) {
      console.error("Error generating code:", error);

      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Oops! Something went wrong. Can you try again?",
      };

      setProject((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code changes from the editor
  const handleCodeChange = (newCode: string) => {
    setProject((prev) => ({
      ...prev,
      currentCode: newCode,
    }));
  };

  // Handle project name change
  const handleNameChange = (name: string) => {
    setProject((prev) => ({
      ...prev,
      name,
    }));
  };

  // Create a new project
  const handleNewProject = () => {
    if (project.messages.length > 0 || project.currentCode) {
      const confirmed = window.confirm(
        "Start a new project? Your current work will be saved to your gallery."
      );
      if (!confirmed) return;
      saveProject();
    }
    const newProject = createNewProject();
    setProject(newProject);
    setCurrentProjectId(newProject.id);
    setLastSaved(null);
    setPreviousCode(undefined);
  };

  // Handle canvas errors
  const handleCanvasError = (message: string) => {
    console.log("Canvas error:", message);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <ProjectHeader
        projectName={project.name}
        onNameChange={handleNameChange}
        onNew={handleNewProject}
        lastSaved={lastSaved}
      />

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-[400px] min-w-[320px] border-r border-gray-200 flex-shrink-0">
          <ChatPanel
            messages={project.messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Right Panel - Code + Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Code Editor */}
          <div className="h-1/2 border-b border-gray-700">
            <CodePanel
              code={project.currentCode}
              previousCode={previousCode}
              onChange={handleCodeChange}
            />
          </div>

          {/* Canvas Preview */}
          <div className="h-1/2">
            <CanvasPanel
              code={project.currentCode}
              onError={handleCanvasError}
              isGenerating={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
