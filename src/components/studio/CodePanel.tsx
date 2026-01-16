"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Copy, Check, Code } from "lucide-react";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

interface CodePanelProps {
  code: string;
  previousCode?: string;
  onChange: (code: string) => void;
}

// Calculate which lines changed between old and new code
function getChangedLines(oldCode: string, newCode: string): Set<number> {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const changedLines = new Set<number>();

  // Simple diff: compare line by line
  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] ?? '';
    const newLine = newLines[i] ?? '';

    if (oldLine !== newLine) {
      changedLines.add(i);
    }
  }

  // If new code has more lines, mark them all as changed
  if (newLines.length > oldLines.length) {
    for (let i = oldLines.length; i < newLines.length; i++) {
      changedLines.add(i);
    }
  }

  return changedLines;
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

  // Calculate changed lines when code updates from AI
  const changedLines = useMemo(() => {
    if (!previousCode || !code || previousCode === code) {
      return new Set<number>();
    }
    return getChangedLines(previousCode, code);
  }, [previousCode, code]);

  // Apply highlighting and scroll to first change when changed lines update
  useEffect(() => {
    if (editorView && changedLines.size > 0) {
      // Apply highlighting
      editorView.dispatch({
        effects: setHighlightedLines.of(changedLines),
      });
      setShowingChanges(true);

      // Scroll to the first changed line
      const firstChangedLine = Math.min(...Array.from(changedLines));
      const line = editorView.state.doc.line(firstChangedLine + 1);

      // Small delay to ensure the editor has updated
      setTimeout(() => {
        editorView.dispatch({
          effects: EditorView.scrollIntoView(line.from, {
            y: "start",
            yMargin: 50,
          }),
        });
      }, 100);

      // Auto-clear highlights after 8 seconds
      const timer = setTimeout(() => {
        editorView.dispatch({
          effects: setHighlightedLines.of(new Set()),
        });
        setShowingChanges(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [editorView, changedLines]);

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
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">sketch.js</span>
          {showingChanges && changedLines.size > 0 && (
            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              {changedLines.size} line{changedLines.size !== 1 ? 's' : ''} changed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showingChanges && (
            <button
              onClick={handleClearHighlights}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400
                         hover:bg-[#3c3c3c] rounded transition-colors"
            >
              Clear highlights
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

      {/* Editor */}
      <div className="flex-1 overflow-auto">
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
    </div>
  );
}
