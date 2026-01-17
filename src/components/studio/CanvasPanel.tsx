"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RefreshCw, Sparkles, Grid3X3 } from "lucide-react";

interface CanvasPanelProps {
  code: string;
  onError?: (message: string) => void;
  isGenerating?: boolean;
}

export function CanvasPanel({ code, onError, isGenerating = false }: CanvasPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

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
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
              showGrid
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-300 hover:bg-[#3a3a5c]"
            }`}
            title="Toggle coordinate grid"
          >
            <Grid3X3 size={12} />
            Grid
          </button>
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

      {/* Canvas - container that scales to fit available space */}
      <div className="flex-1 flex items-center justify-center p-2 min-h-0 min-w-0 overflow-hidden">
        <div
          className="relative rounded-lg overflow-hidden bg-white h-full aspect-square max-w-full"
        >
          <iframe
            ref={iframeRef}
            src="/sandbox.html"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full"
            style={{ border: "none" }}
          />

          {/* Coordinate Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Grid lines - every 50 pixels */}
                <defs>
                  <pattern id="smallGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="rgba(59, 130, 246, 0.3)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                  <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#smallGrid)" />
                    <path
                      d="M 100 0 L 0 0 0 100"
                      fill="none"
                      stroke="rgba(59, 130, 246, 0.5)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="400" height="400" fill="url(#grid)" />

                {/* X-axis labels */}
                {[0, 100, 200, 300, 400].map((x) => (
                  <text
                    key={`x-${x}`}
                    x={x}
                    y="395"
                    fontSize="10"
                    fill="rgba(59, 130, 246, 0.8)"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {x}
                  </text>
                ))}

                {/* Y-axis labels */}
                {[0, 100, 200, 300, 400].map((y) => (
                  <text
                    key={`y-${y}`}
                    x="5"
                    y={y + 3}
                    fontSize="10"
                    fill="rgba(59, 130, 246, 0.8)"
                    textAnchor="start"
                    fontFamily="monospace"
                  >
                    {y}
                  </text>
                ))}

                {/* Origin marker */}
                <circle cx="0" cy="0" r="4" fill="rgba(59, 130, 246, 0.8)" />
                <text
                  x="12"
                  y="14"
                  fontSize="11"
                  fill="rgba(59, 130, 246, 0.9)"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  (0,0)
                </text>

                {/* Axis arrows and labels */}
                <g>
                  {/* X-axis arrow */}
                  <line
                    x1="30"
                    y1="30"
                    x2="80"
                    y2="30"
                    stroke="rgba(236, 72, 153, 0.8)"
                    strokeWidth="2"
                    markerEnd="url(#arrowX)"
                  />
                  <defs>
                    <marker
                      id="arrowX"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="rgba(236, 72, 153, 0.8)" />
                    </marker>
                  </defs>
                  <text
                    x="90"
                    y="34"
                    fontSize="11"
                    fill="rgba(236, 72, 153, 0.9)"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    x →
                  </text>

                  {/* Y-axis arrow */}
                  <line
                    x1="30"
                    y1="30"
                    x2="30"
                    y2="80"
                    stroke="rgba(34, 197, 94, 0.8)"
                    strokeWidth="2"
                    markerEnd="url(#arrowY)"
                  />
                  <defs>
                    <marker
                      id="arrowY"
                      markerWidth="10"
                      markerHeight="10"
                      refX="3"
                      refY="9"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L6,0 L3,9 z" fill="rgba(34, 197, 94, 0.8)" />
                    </marker>
                  </defs>
                  <text
                    x="34"
                    y="95"
                    fontSize="11"
                    fill="rgba(34, 197, 94, 0.9)"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    y ↓
                  </text>
                </g>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Fun Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-[#1a1a2e]/90 flex flex-col items-center justify-center z-10">
          {/* Animated sparkles */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles
                size={48}
                className="text-blue-400 animate-pulse"
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
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
