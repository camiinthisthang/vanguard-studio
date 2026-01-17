"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { Sparkles } from "lucide-react";
import { Message } from "@/lib/storage";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
}

export function ChatPanel({ messages, onSendMessage, isLoading }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="h-14 border-b border-gray-200 flex items-center px-4 gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">AI Assistant</h2>
          <p className="text-xs text-gray-500">Ready to help you create!</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Let&apos;s create something amazing!
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Tell me what you want to make and I&apos;ll help you code it.
            </p>
            <div className="space-y-2 w-full max-w-xs">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Try saying:</p>
              {[
                "Make a bouncing ball",
                "Draw a rainbow",
                "Make stars that twinkle",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSendMessage(suggestion)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-600
                             bg-gray-50 hover:bg-blue-50 hover:text-blue-600
                             rounded-xl transition-colors border border-gray-100"
                >
                  &ldquo;{suggestion}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <PromptInput
        onSubmit={onSendMessage}
        isLoading={isLoading}
        placeholder={
          messages.length === 0
            ? "Try: make a bouncing ball"
            : "What do you want to add or change?"
        }
      />
    </div>
  );
}
