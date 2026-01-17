"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Code, ArrowRight, Play, ExternalLink } from "lucide-react";
import { decodeSharedProject } from "@/lib/storage";

export default function SharePage() {
  const params = useParams();
  const [projectData, setProjectData] = useState<{ name: string; code: string } | null>(null);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (params.code) {
      const decoded = decodeSharedProject(params.code as string);
      if (decoded) {
        setProjectData(decoded);
      } else {
        setError(true);
      }
    }
  }, [params.code]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sketch Not Found</h1>
          <p className="text-gray-400 mb-6">This link may be invalid or expired.</p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your Own
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-semibold">Vanguard Studio</span>
              <p className="text-xs text-blue-300">AI + Code = Art</p>
            </div>
          </div>
          <Link
            href="/studio"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try It Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Canvas Preview */}
          <div className="order-1 lg:order-1">
            <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <div className="aspect-square relative">
                {isPlaying ? (
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
                        <style>
                          body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1a2e; overflow: hidden; }
                          canvas { border-radius: 8px; }
                        </style>
                      </head>
                      <body>
                        <script>${projectData.code}</script>
                      </body>
                      </html>
                    `}
                    className="w-full h-full"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="p-6 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                    >
                      <Play size={32} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mt-6 text-center lg:text-left">
              {projectData.name}
            </h1>
          </div>

          {/* Info & CTA */}
          <div className="order-2 lg:order-2 space-y-6">
            {/* Made with badge */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Made with AI + Code</p>
                  <p className="text-sm text-gray-400">using Vanguard Studio</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                This artwork was created by describing ideas to an AI assistant, which then
                generated the code to bring it to life. No prior coding experience needed!
              </p>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
              <h2 className="text-xl font-bold mb-2">
                Want to create your own?
              </h2>
              <p className="text-blue-100 text-sm mb-6">
                Vanguard Studio helps kids (and adults!) learn coding by creating
                art and games with AI. Just describe what you want to make!
              </p>
              <div className="space-y-3">
                <Link
                  href="/studio"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Start Creating Free
                  <ArrowRight size={18} />
                </Link>
                <p className="text-xs text-blue-200 text-center">
                  No sign-up required. Start in seconds.
                </p>
              </div>
            </div>

            {/* Code Preview */}
            <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-400">The code behind it</span>
                </div>
                <a
                  href="/studio"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Edit in Studio
                  <ExternalLink size={12} />
                </a>
              </div>
              <pre className="p-4 text-xs text-gray-300 overflow-x-auto max-h-64">
                <code>{projectData.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Sparkles size={16} className="text-blue-400" />
            <span>Vanguard Studio - Learn to code by creating</span>
          </div>
          <Link
            href="/studio"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            Create your own sketch
            <ArrowRight size={14} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
