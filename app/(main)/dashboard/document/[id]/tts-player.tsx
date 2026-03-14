"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause, Square } from "lucide-react";
import { toast } from "sonner";

interface TTSPlayerProps {
  text: string;
}

export function TTSPlayer({ text }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cleanMarkdown = (md: string) => {
    return md
      .replace(/#{1,6}\s/g, "") // Headers
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // Bold
      .replace(/(\*|_)(.*?)\1/g, "$2") // Italic
      .replace(/\[(.*?)\]\(.*?\)/g, "$2") // Links
      .replace(/`{1,3}.*?`{1,3}/g, "") // Code blocks
      .replace(/>\s/g, "") // Blockquotes
      .replace(/[-*]\s/g, "") // Bullet points
      .replace(/\n+/g, " ") // New lines to spaces
      .trim();
  };

  const handlePlay = () => {
    if (!window.speechSynthesis) {
      toast.error("Your browser does not support text-to-speech.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Clean up previous synthesis
    window.speechSynthesis.cancel();

    const cleanedText = cleanMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Attempt to find a natural sounding voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Premium"));
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error("TTS Error:", event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
      {!isPlaying && !isPaused ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlay}
          className="h-8 w-8 p-0 hover:bg-white hover:text-blue-600 rounded-full transition-all"
          title="Listen to simplified text"
        >
          <Play className="h-4 w-4 fill-current" />
        </Button>
      ) : (
        <>
          {isPaused ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlay}
              className="h-8 w-8 p-0 hover:bg-white hover:text-blue-600 rounded-full transition-all"
              title="Resume"
            >
              <Play className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePause}
              className="h-8 w-8 p-0 hover:bg-white hover:text-blue-600 rounded-full transition-all"
              title="Pause"
            >
              <Pause className="h-4 w-4 fill-current" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStop}
            className="h-8 w-8 p-0 hover:bg-white hover:text-red-600 rounded-full transition-all"
            title="Stop"
          >
            <Square className="h-3 w-3 fill-current" />
          </Button>
        </>
      )}
      <div className="flex items-center gap-2 px-1 border-l border-slate-300 ml-1">
        <Volume2 className="h-4 w-4 text-slate-500" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Listen</span>
      </div>
    </div>
  );
}
