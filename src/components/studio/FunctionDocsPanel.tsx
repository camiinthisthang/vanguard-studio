"use client";

import { useState, useMemo } from "react";
import { BookOpen, ChevronRight, X } from "lucide-react";
import { findFrequentFunctions, FunctionDoc } from "@/lib/p5-docs";

// Mini preview component for function playground
function FunctionPlayground({ func }: { func: FunctionDoc }) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    func.args.forEach(arg => {
      initial[arg.name] = arg.default ?? 50;
    });
    return initial;
  });
  const [activeArg, setActiveArg] = useState<string | null>(null);

  const handleSliderChange = (argName: string, value: number) => {
    setValues(prev => ({ ...prev, [argName]: value }));
  };

  // Generate the preview SVG based on function type
  const renderPreview = () => {
    const v = values;

    if (func.previewType === 'color') {
      const r = v.r ?? 128;
      const g = v.g ?? 128;
      const b = v.b ?? 128;
      return (
        <div
          className="w-full h-20 rounded-lg border-2 border-gray-600"
          style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
        />
      );
    }

    // Generate the label showing all argument values with active arg highlighted
    const renderArgsLabel = (x: number, y: number) => (
      <text x={x} y={y} fontSize="8" textAnchor="middle" fontFamily="monospace">
        <tspan fill="rgba(255,255,255,0.9)">(</tspan>
        {func.args.map((arg, i) => (
          <tspan key={arg.name}>
            <tspan fill={activeArg === arg.name ? "#4ade80" : "rgba(255,255,255,0.9)"} fontWeight={activeArg === arg.name ? "bold" : "normal"}>
              {Math.round(values[arg.name] ?? 0)}
            </tspan>
            {i < func.args.length - 1 && <tspan fill="rgba(255,255,255,0.9)">, </tspan>}
          </tspan>
        ))}
        <tspan fill="rgba(255,255,255,0.9)">)</tspan>
      </text>
    );

    // Shape preview - simple with just the shape and all-args label
    return (
      <svg viewBox="0 0 100 100" className="w-full h-40 bg-[#1a1a2e] rounded-lg">
        {/* Grid for reference */}
        <defs>
          <pattern id="previewGrid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#previewGrid)" />

        {/* CIRCLE */}
        {func.name === 'circle' && (
          <>
            <circle cx={v.x} cy={v.y} r={v.d / 2} fill="rgba(59, 130, 246, 0.5)" stroke="#3b82f6" strokeWidth="2"/>
            <circle cx={v.x} cy={v.y} r="2" fill="white"/>
            {renderArgsLabel(v.x, v.y - v.d / 2 - 6)}
          </>
        )}

        {/* ELLIPSE */}
        {func.name === 'ellipse' && (
          <>
            <ellipse cx={v.x} cy={v.y} rx={v.w / 2} ry={v.h / 2} fill="rgba(59, 130, 246, 0.5)" stroke="#3b82f6" strokeWidth="2"/>
            <circle cx={v.x} cy={v.y} r="2" fill="white"/>
            {renderArgsLabel(v.x, v.y - v.h / 2 - 6)}
          </>
        )}

        {/* RECT */}
        {func.name === 'rect' && (
          <>
            <rect x={v.x} y={v.y} width={v.w} height={v.h} fill="rgba(59, 130, 246, 0.5)" stroke="#3b82f6" strokeWidth="2"/>
            <circle cx={v.x} cy={v.y} r="2" fill="white"/>
            {renderArgsLabel(v.x + v.w / 2, v.y - 6)}
          </>
        )}

        {/* SQUARE */}
        {func.name === 'square' && (
          <>
            <rect x={v.x} y={v.y} width={v.s} height={v.s} fill="rgba(59, 130, 246, 0.5)" stroke="#3b82f6" strokeWidth="2"/>
            <circle cx={v.x} cy={v.y} r="2" fill="white"/>
            {renderArgsLabel(v.x + v.s / 2, v.y - 6)}
          </>
        )}

        {/* LINE */}
        {func.name === 'line' && (
          <>
            <line x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <circle cx={v.x1} cy={v.y1} r="3" fill="#f472b6"/>
            <circle cx={v.x2} cy={v.y2} r="3" fill="#4ade80"/>
            {renderArgsLabel(50, 12)}
          </>
        )}

        {/* ARC */}
        {func.name === 'arc' && (
          <>
            <ellipse cx={v.x} cy={v.y} rx={v.w / 2} ry={v.h / 2} fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" strokeDasharray="3"/>
            <path d={describeArc(v.x, v.y, v.w / 2, v.h / 2, v.start ?? 0, v.stop ?? 3.14)} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
            <circle cx={v.x} cy={v.y} r="2" fill="white"/>
            {renderArgsLabel(50, 12)}
          </>
        )}

        {/* STROKEWEIGHT */}
        {func.name === 'strokeWeight' && (
          <>
            <line x1="20" y1="50" x2="80" y2="50" stroke="#3b82f6" strokeWidth={v.weight} strokeLinecap="round"/>
            {renderArgsLabel(50, 30)}
          </>
        )}
      </svg>
    );
  };

  // Generate code example with current values
  const codeExample = `${func.name}(${func.args.map(arg => Math.round(values[arg.name] ?? 0)).join(', ')})`;

  return (
    <div className="space-y-3">
      <p className="text-gray-300 text-sm">{func.description}</p>

      {/* Mini preview */}
      {func.previewType && func.previewType !== 'none' && (
        <div className="mb-3">
          {renderPreview()}
        </div>
      )}

      {/* Sliders */}
      {func.args.length > 0 && func.args.some(arg => arg.min !== undefined) && (
        <div className="space-y-3">
          {func.args.map((arg) => (
            arg.min !== undefined && (
              <div key={arg.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-medium ${activeArg === arg.name ? 'text-green-400' : 'text-blue-400'}`}>{arg.name}</span>
                  <span className={`px-2 py-0.5 rounded font-mono ${activeArg === arg.name ? 'text-green-400 bg-green-900/30' : 'text-gray-400 bg-[#1e1e1e]'}`}>
                    {Math.round(values[arg.name] ?? arg.default ?? 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min={arg.min}
                  max={arg.max}
                  step={arg.step ?? 1}
                  value={values[arg.name] ?? arg.default ?? 50}
                  onChange={(e) => handleSliderChange(arg.name, parseFloat(e.target.value))}
                  onFocus={() => setActiveArg(arg.name)}
                  onBlur={() => setActiveArg(null)}
                  onMouseDown={() => setActiveArg(arg.name)}
                  onMouseUp={() => setActiveArg(null)}
                  onTouchStart={() => setActiveArg(arg.name)}
                  onTouchEnd={() => setActiveArg(null)}
                  className="w-full h-2 bg-[#1e1e1e] rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:hover:bg-blue-400"
                />
                <p className="text-xs text-gray-500">{arg.description}</p>
              </div>
            )
          ))}
        </div>
      )}

      {/* Live code example */}
      <div className="p-3 bg-[#1e1e1e] rounded-lg font-mono text-sm text-green-400">
        {codeExample}
      </div>
    </div>
  );
}

// Helper function for arc path (supports elliptical arcs)
function describeArc(x: number, y: number, rx: number, ry: number, startAngle: number, endAngle: number): string {
  const start = {
    x: x + rx * Math.cos(startAngle),
    y: y + ry * Math.sin(startAngle)
  };
  const end = {
    x: x + rx * Math.cos(endAngle),
    y: y + ry * Math.sin(endAngle)
  };
  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
  return `M ${start.x} ${start.y} A ${rx} ${ry} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

interface FunctionDocsPanelProps {
  code: string;
  onClose: () => void;
}

export function FunctionDocsPanel({ code, onClose }: FunctionDocsPanelProps) {
  const [expandedFunc, setExpandedFunc] = useState<string | null>(null);

  // Find frequently used p5.js functions
  const frequentFunctions = useMemo(() => {
    if (!code) return [];
    return findFrequentFunctions(code, 4);
  }, [code]);

  if (frequentFunctions.length === 0) {
    return null;
  }

  return (
    <div className="h-full bg-[#1e1e1e] overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-[#3c3c3c] flex items-center justify-between sticky top-0 bg-[#1e1e1e] z-10">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" />
          <span className="text-sm text-gray-300 font-medium">Functions Used</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-300 hover:bg-[#3c3c3c] rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-3 space-y-2 flex-1">
        {frequentFunctions.map(({ func, count }) => (
          <div key={func.name} className="rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedFunc(expandedFunc === func.name ? null : func.name)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                expandedFunc === func.name
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-[#2d2d2d] text-gray-300 hover:bg-[#3c3c3c]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium">{func.name}()</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">{count}x</span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${expandedFunc === func.name ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>
            </button>
            {expandedFunc === func.name && (
              <div className="bg-[#252526] px-4 py-4">
                <FunctionPlayground func={func} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
