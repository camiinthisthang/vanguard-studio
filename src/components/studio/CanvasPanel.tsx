"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RefreshCw, Sparkles } from "lucide-react";

interface CanvasPanelProps {
  code: string;
  onError?: (message: string) => void;
  isGenerating?: boolean;
}

export function CanvasPanel({ code, onError, isGenerating = false }: CanvasPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Run code in the sandbox
  const runCode = () => {
    if (!iframeRef.current?.contentWindow || !code.trim()) return;

    setIsRunning(true);
    iframeRef.current.contentWindow.postMessage(
      { type: "run-code", code },
      "*"
    );
  };

  // Listen for messages from the sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "success") {
        setIsRunning(false);
      } else if (event.data.type === "error") {
        setIsRunning(false);
        onError?.(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onError]);

  // Auto-run when code changes
  useEffect(() => {
    if (code.trim()) {
      // Small delay to ensure iframe is ready
      const timer = setTimeout(runCode, 100);
      return () => clearTimeout(timer);
    }
  }, [code]);

  // Reload sandbox
  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setTimeout(runCode, 300);
    }
  };

  // Fun loading messages
  const loadingMessages = [
    "Mixing colors...",
    "Drawing shapes...",
    "Adding sparkles...",
    "Making magic...",
    "Almost there...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!isGenerating) {
      setMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % loadingMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] relative">
      {/* Header */}
      <div className="h-10 bg-[#252542] border-b border-[#3a3a5c] flex items-center justify-between px-3">
        <span className="text-xs text-gray-400 font-medium">Preview</span>
        <div className="flex items-center gap-1">
          <button
            onClick={runCode}
            disabled={!code.trim() || isRunning || isGenerating}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300
                       hover:bg-[#3a3a5c] rounded transition-colors disabled:opacity-50"
          >
            <Play size={12} />
            Run
          </button>
          <button
            onClick={handleReload}
            className="p-1 text-gray-400 hover:bg-[#3a3a5c] rounded transition-colors"
            title="Reload preview"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/sandbox.html"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full max-w-[420px] max-h-[420px] rounded-lg"
          style={{ border: "none" }}
        />
      </div>

      {/* Fun Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-[#1a1a2e]/90 flex flex-col items-center justify-center z-10">
          {/* Animated sparkles */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles
                size={48}
                className="text-violet-400 animate-pulse"
              />
            </div>
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-400 rounded-full" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
            </div>
          </div>

          {/* Loading message */}
          <p className="text-lg font-medium text-white mb-2">
            {loadingMessages[messageIndex]}
          </p>
          <p className="text-sm text-gray-400">
            The AI is creating your code
          </p>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
