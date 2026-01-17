// Storage utilities for managing projects

export interface Project {
  id: string;
  name: string;
  messages: Message[];
  currentCode: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // Base64 data URL of canvas snapshot
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  code?: string;
}

const STORAGE_KEY = "vanguard_projects";
const CURRENT_PROJECT_KEY = "vanguard_current_project_id";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function getAllProjects(): Project[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(project: Project): void {
  if (typeof window === "undefined") return;

  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    projects[index] = updatedProject;
  } else {
    projects.unshift(updatedProject); // Add to beginning
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;

  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getCurrentProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

export function setCurrentProjectId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_PROJECT_KEY, id);
}

export function createNewProject(): Project {
  return {
    id: generateId(),
    name: "Untitled Sketch",
    messages: [],
    currentCode: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate a shareable code from project data
export function encodeProjectForShare(project: Project): string {
  const shareData = {
    name: project.name,
    code: project.currentCode,
  };
  return btoa(encodeURIComponent(JSON.stringify(shareData)));
}

// Decode shared project data
export function decodeSharedProject(encoded: string): { name: string; code: string } | null {
  try {
    const decoded = decodeURIComponent(atob(encoded));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
