"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Share2,
  Play,
  Code,
  Clock,
} from "lucide-react";
import {
  Project,
  getAllProjects,
  deleteProject,
  setCurrentProjectId,
  encodeProjectForShare,
} from "@/lib/storage";

export default function GalleryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setProjects(getAllProjects());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this sketch? This cannot be undone.")) {
      deleteProject(id);
      setProjects(getAllProjects());
    }
  };

  const handleShare = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = encodeProjectForShare(project);
    const url = `${window.location.origin}/share/${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(project.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: show URL in prompt
      prompt("Copy this share link:", url);
    }
  };

  const handleOpen = (project: Project) => {
    setCurrentProjectId(project.id);
    router.push("/studio");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/studio"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Sketches</h1>
              <p className="text-sm text-gray-500">
                {projects.length} sketch{projects.length !== 1 ? "es" : ""} saved
              </p>
            </div>
          </div>
          <Link
            href="/studio"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New Sketch
          </Link>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Code size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No sketches yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first sketch and it will appear here!
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Create Your First Sketch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpen(project)}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all"
              >
                {/* Preview */}
                <div className="aspect-square bg-[#1a1a2e] relative overflow-hidden">
                  {project.currentCode ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
                            <style>
                              body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1a2e; overflow: hidden; }
                              canvas { max-width: 100%; max-height: 100%; }
                            </style>
                          </head>
                          <body>
                            <script>${project.currentCode}</script>
                          </body>
                          </html>
                        `}
                        className="w-full h-full pointer-events-none"
                        sandbox="allow-scripts"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <Code size={48} className="opacity-30" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="p-3 bg-white rounded-full text-gray-800 hover:bg-blue-50 transition-colors">
                      <Play size={20} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleShare(project, e)}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedId === project.id
                            ? "bg-green-100 text-green-600"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        }`}
                        title={copiedId === project.id ? "Link copied!" : "Share"}
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
