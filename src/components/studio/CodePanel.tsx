"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Copy, Check, Code, ChevronUp, ChevronDown, BookOpen, ChevronRight } from "lucide-react";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { findFrequentFunctions, FunctionDoc } from "@/lib/p5-docs";

interface CodePanelProps {
  code: string;
  previousCode?: string;
  onChange: (code: string) => void;
}

interface ChangeBlock {
  startLine: number;
  endLine: number;
  label: string;
  type: 'added' | 'modified';
}

// Detect what a block of code does based on its content
function detectChangeLabel(lines: string[]): string {
  const content = lines.join('\n').toLowerCase();

  // Check for function definitions
  const funcMatch = content.match(/function\s+(\w+)/);
  if (funcMatch) return `Added ${funcMatch[1]}() function`;

  // Check for variable assignments with keywords
  if (content.includes('velocity') || content.includes('speed')) return 'Added movement speed';
  if (content.includes('gravity')) return 'Added gravity';
  if (content.includes('jump')) return 'Added jump mechanic';
  if (content.includes('score')) return 'Added score tracking';
  if (content.includes('color') || content.includes('fill(')) return 'Changed colors';
  if (content.includes('circle') || content.includes('ellipse')) return 'Added/modified circle';
  if (content.includes('rect')) return 'Added/modified rectangle';
  if (content.includes('keyispressed') || content.includes('keypressed')) return 'Added keyboard controls';
  if (content.includes('mousex') || content.includes('mousey')) return 'Added mouse interaction';
  if (content.includes('random')) return 'Added randomness';
  if (content.includes('if') && content.includes('else')) return 'Added condition logic';
  if (content.includes('for') || content.includes('while')) return 'Added loop';

  // Check for specific p5.js functions
  if (content.includes('background(')) return 'Changed background';
  if (content.includes('createcanvas')) return 'Changed canvas size';
  if (content.includes('text(')) return 'Added/modified text';
  if (content.includes('image(')) return 'Added image';

  // Fallback based on line count
  const lineCount = lines.filter(l => l.trim()).length;
  if (lineCount === 1) return 'Modified line';
  return `Modified ${lineCount} lines`;
}

// Calculate change blocks - groups of consecutive changed lines with labels
function getChangeBlocks(oldCode: string, newCode: string): ChangeBlock[] {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const blocks: ChangeBlock[] = [];

  let currentBlock: { start: number; lines: string[] } | null = null;

  for (let i = 0; i < newLines.length; i++) {
    const oldLine = oldLines[i] ?? '';
    const newLine = newLines[i] ?? '';
    const isChanged = oldLine !== newLine;

    if (isChanged) {
      if (!currentBlock) {
        currentBlock = { start: i, lines: [] };
      }
      currentBlock.lines.push(newLine);
    } else if (currentBlock) {
      // End of a block
      blocks.push({
        startLine: currentBlock.start,
        endLine: currentBlock.start + currentBlock.lines.length - 1,
        label: detectChangeLabel(currentBlock.lines),
        type: oldLines[currentBlock.start] === undefined ? 'added' : 'modified'
      });
      currentBlock = null;
    }
  }

  // Don't forget the last block
  if (currentBlock) {
    blocks.push({
      startLine: currentBlock.start,
      endLine: currentBlock.start + currentBlock.lines.length - 1,
      label: detectChangeLabel(currentBlock.lines),
      type: oldLines[currentBlock.start] === undefined ? 'added' : 'modified'
    });
  }

  return blocks;
}

// Effect to update highlighted lines
const setHighlightedLines = StateEffect.define<Set<number>>();

// State field to track highlighted line decorations
const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlightedLines)) {
        const changedLines = effect.value;
        const newDecorations: any[] = [];

        // Create decorations for each changed line
        let pos = 0;
        const doc = tr.state.doc;
        for (let i = 0; i < doc.lines; i++) {
          if (changedLines.has(i)) {
            const line = doc.line(i + 1);
            newDecorations.push(
              Decoration.line({ class: "cm-changed-line" }).range(line.from)
            );
          }
        }

        return Decoration.set(newDecorations);
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Theme for highlighted lines
const highlightTheme = EditorView.baseTheme({
  ".cm-changed-line": {
    backgroundColor: "rgba(34, 197, 94, 0.15) !important",
    borderLeft: "3px solid #22c55e",
    marginLeft: "-3px",
  },
});

export function CodePanel({ code, previousCode, onChange }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [showingChanges, setShowingChanges] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [showDocs, setShowDocs] = useState(true);
  const [expandedFunc, setExpandedFunc] = useState<string | null>(null);

  // Find frequently used p5.js functions
  const frequentFunctions = useMemo(() => {
    if (!code) return [];
    return findFrequentFunctions(code, 4);
  }, [code]);

  // Calculate change blocks when code updates from AI
  const changeBlocks = useMemo(() => {
    if (!previousCode || !code || previousCode === code) {
      return [];
    }
    return getChangeBlocks(previousCode, code);
  }, [previousCode, code]);

  // Get all changed line numbers for highlighting
  const changedLines = useMemo(() => {
    const lines = new Set<number>();
    changeBlocks.forEach(block => {
      for (let i = block.startLine; i <= block.endLine; i++) {
        lines.add(i);
      }
    });
    return lines;
  }, [changeBlocks]);

  // Navigate to a specific block
  const navigateToBlock = useCallback((blockIndex: number) => {
    if (!editorView || blockIndex < 0 || blockIndex >= changeBlocks.length) return;

    const block = changeBlocks[blockIndex];
    const line = editorView.state.doc.line(block.startLine + 1);

    editorView.dispatch({
      effects: EditorView.scrollIntoView(line.from, {
        y: "center",
        yMargin: 100,
      }),
    });
    setCurrentBlockIndex(blockIndex);
  }, [editorView, changeBlocks]);

  // Apply highlighting and scroll to first change when changed lines update
  useEffect(() => {
    if (editorView && changedLines.size > 0) {
      // Apply highlighting
      editorView.dispatch({
        effects: setHighlightedLines.of(changedLines),
      });
      setShowingChanges(true);
      setCurrentBlockIndex(0);

      // Scroll to the first block
      if (changeBlocks.length > 0) {
        const firstBlock = changeBlocks[0];
        const line = editorView.state.doc.line(firstBlock.startLine + 1);

        setTimeout(() => {
          editorView.dispatch({
            effects: EditorView.scrollIntoView(line.from, {
              y: "center",
              yMargin: 100,
            }),
          });
        }, 100);
      }

      // Auto-clear highlights after 15 seconds (longer for review)
      const timer = setTimeout(() => {
        editorView.dispatch({
          effects: setHighlightedLines.of(new Set()),
        });
        setShowingChanges(false);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [editorView, changedLines, changeBlocks]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [code]);

  // Clear highlights manually
  const handleClearHighlights = useCallback(() => {
    if (editorView) {
      editorView.dispatch({
        effects: setHighlightedLines.of(new Set()),
      });
      setShowingChanges(false);
    }
  }, [editorView]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] relative">
      {/* Header */}
      <div className="bg-[#252526] border-b border-[#3c3c3c]">
        <div className="h-10 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <Code size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">sketch.js</span>
          </div>
          <div className="flex items-center gap-2">
            {showingChanges && (
              <button
                onClick={handleClearHighlights}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400
                           hover:bg-[#3c3c3c] rounded transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400
                         hover:bg-[#3c3c3c] rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Change blocks navigator */}
        {showingChanges && changeBlocks.length > 0 && (
          <div className="px-3 pb-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Changes:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {changeBlocks.map((block, index) => (
                <button
                  key={index}
                  onClick={() => navigateToBlock(index)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    currentBlockIndex === index
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-[#3c3c3c] text-gray-300 hover:bg-[#4c4c4c]'
                  }`}
                >
                  {block.label}
                  <span className="ml-1 text-gray-500">L{block.startLine + 1}</span>
                </button>
              ))}
            </div>
            {changeBlocks.length > 1 && (
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => navigateToBlock(currentBlockIndex - 1)}
                  disabled={currentBlockIndex === 0}
                  className="p-1 text-gray-400 hover:bg-[#3c3c3c] rounded disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => navigateToBlock(currentBlockIndex + 1)}
                  disabled={currentBlockIndex === changeBlocks.length - 1}
                  className="p-1 text-gray-400 hover:bg-[#3c3c3c] rounded disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor + Docs Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={`flex-1 overflow-auto ${frequentFunctions.length > 0 && showDocs ? 'border-r border-[#3c3c3c]' : ''}`}>
          {code ? (
            <CodeMirror
              value={code}
              height="100%"
              extensions={[javascript(), highlightField, highlightTheme]}
              onChange={onChange}
              onCreateEditor={(view) => setEditorView(view)}
              theme="dark"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: false,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: false,
                crosshairCursor: false,
                highlightSelectionMatches: false,
                searchKeymap: false,
              }}
              className="text-sm h-full"
              style={{ height: "100%" }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center px-4">
                <Code size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Your code will appear here</p>
                <p className="text-xs mt-1 text-gray-600">
                  Ask the AI to create something!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Function Documentation Panel */}
        {frequentFunctions.length > 0 && showDocs && (
          <div className="w-64 bg-[#1e1e1e] overflow-y-auto flex-shrink-0">
            <div className="p-3 border-b border-[#3c3c3c] flex items-center justify-between sticky top-0 bg-[#1e1e1e] z-10">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-blue-400" />
                <span className="text-xs text-gray-300 font-medium">Functions Used</span>
              </div>
              <button
                onClick={() => setShowDocs(false)}
                className="text-gray-500 hover:text-gray-300 text-xs"
              >
                Hide
              </button>
            </div>
            <div className="p-2 space-y-1">
              {frequentFunctions.map(({ func, count }) => (
                <div key={func.name} className="rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFunc(expandedFunc === func.name ? null : func.name)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      expandedFunc === func.name
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-[#2d2d2d] text-gray-300 hover:bg-[#3c3c3c]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium">{func.name}()</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{count}x</span>
                        <ChevronRight
                          size={12}
                          className={`transition-transform ${expandedFunc === func.name ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>
                  </button>
                  {expandedFunc === func.name && (
                    <div className="bg-[#252526] px-3 py-2 text-xs space-y-2">
                      <p className="text-gray-300">{func.description}</p>
                      {func.args.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-gray-500 text-[10px] uppercase tracking-wide">Arguments:</p>
                          {func.args.map((arg, i) => (
                            <div key={i} className="flex gap-2">
                              <span className="text-blue-400 font-mono">{arg.name}</span>
                              <span className="text-gray-400">- {arg.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {func.example && (
                        <div className="mt-2 p-2 bg-[#1e1e1e] rounded font-mono text-gray-400">
                          {func.example}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show docs toggle when hidden */}
        {frequentFunctions.length > 0 && !showDocs && (
          <button
            onClick={() => setShowDocs(true)}
            className="absolute right-2 top-14 p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            title="Show function docs"
          >
            <BookOpen size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
