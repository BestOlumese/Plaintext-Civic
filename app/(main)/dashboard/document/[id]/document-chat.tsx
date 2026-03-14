"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export function DocumentChat({ documentId }: { documentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitial, setIsFetchingInitial] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchMessages();
    }
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setIsFetchingInitial(true);
    try {
      const res = await fetch(`/api/chat?documentId=${documentId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsFetchingInitial(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Optimistic Update
    const newUserMsg: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage, documentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      const assistantMsg = await res.json();
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      toast.error(error.message);
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m !== newUserMsg));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 text-white z-50 transition-all hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <Card className="flex-1 flex flex-col border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden rounded-2xl">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-blue-600 text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Ask Document AI</CardTitle>
              <p className="text-[10px] text-blue-100">Contextual understanding active</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent 
          className="flex-1 overflow-y-auto p-4 space-y-4"
          ref={scrollRef}
        >
          {isFetchingInitial ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Hello! I'm your Civic Assistant.</p>
                <p className="text-xs text-slate-500 mt-1">Ask me anything about this document. I'm here to help you understand your rights and the next steps.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full pt-4">
                {[
                  "What is the main goal of this document?",
                  "Are there any deadlines I should know?",
                  "What documents do I need to bring?"
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                        setInput(q);
                        // Using timeout to ensure input state updates before handleSendMessage
                        setTimeout(() => handleSendMessage(), 0);
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 p-2 rounded-lg text-left transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700"
                )}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-200 dark:prose-pre:bg-slate-900">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-2 max-w-[85%] mr-auto">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 px-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 w-full"
          >
            <Input
              placeholder="Ask a question..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border-none h-10 focus-visible:ring-blue-500 rounded-xl px-4 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
