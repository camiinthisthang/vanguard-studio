"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatPanel, Message } from "@/components/studio/ChatPanel";
import { CodePanel } from "@/components/studio/CodePanel";
import { CanvasPanel } from "@/components/studio/CanvasPanel";
import { ProjectHeader } from "@/components/studio/ProjectHeader";

interface Project {
  id: string;
  name: string;
  messages: Message[];
  currentCode: string;
  createdAt: string;
  updatedAt: string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function createNewProject(): Project {
  return {
    id: generateId(),
    name: "Untitled Project",
    messages: [],
    currentCode: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function StudioPage() {
  const [project, setProject] = useState<Project>(createNewProject);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previousCode, setPreviousCode] = useState<string | undefined>(undefined);

  // Load project from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("vanguard_current_project");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProject(parsed);
        setLastSaved(new Date(parsed.updatedAt));
      } catch (e) {
        console.error("Failed to load saved project:", e);
      }
    }
  }, []);

  // Save project to localStorage
  const saveProject = useCallback(() => {
    setIsSaving(true);
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("vanguard_current_project", JSON.stringify(updated));
    setLastSaved(new Date());
    setIsSaving(false);
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
        "Start a new project? Your current work will be saved."
      );
      if (!confirmed) return;
      saveProject();
    }
    setProject(createNewProject());
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
        onSave={saveProject}
        onNew={handleNewProject}
        isSaving={isSaving}
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
