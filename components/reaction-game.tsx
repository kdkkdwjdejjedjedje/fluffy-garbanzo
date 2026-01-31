"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type GameState = "idle" | "waiting" | "ready" | "clicked" | "too-early";

interface ReactionGameProps {
  onResult: (reactionTime: number) => void;
  isLoggedIn: boolean;
}

export function ReactionGame({ onResult, isLoggedIn }: ReactionGameProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    clearTimeoutRef();
    setGameState("waiting");
    setReactionTime(null);

    const delay = Math.random() * 4000 + 1000;

    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      startTimeRef.current = performance.now();
    }, delay);
  }, [clearTimeoutRef]);

  const handleClick = useCallback(() => {
    if (gameState === "idle") {
      startGame();
      return;
    }

    if (gameState === "waiting") {
      clearTimeoutRef();
      setGameState("too-early");
      return;
    }

    if (gameState === "ready") {
      const endTime = performance.now();
      const time = Math.round(endTime - startTimeRef.current);
      setReactionTime(time);
      setGameState("clicked");

      const newAttempts = [...attempts, time];
      setAttempts(newAttempts);

      if (newAttempts.length >= 5) {
        const avgTime = Math.round(
          newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length
        );
        onResult(avgTime);
      }
      return;
    }

    if (gameState === "too-early" || gameState === "clicked") {
      startGame();
    }
  }, [gameState, startGame, clearTimeoutRef, attempts, onResult]);

  const resetGame = useCallback(() => {
    clearTimeoutRef();
    setGameState("idle");
    setReactionTime(null);
    setAttempts([]);
  }, [clearTimeoutRef]);

  useEffect(() => {
    return () => clearTimeoutRef();
  }, [clearTimeoutRef]);

  const getBackgroundClass = () => {
    switch (gameState) {
      case "idle":
        return "bg-secondary hover:bg-secondary/80";
      case "waiting":
        return "bg-accent cursor-wait";
      case "ready":
        return "bg-primary cursor-pointer";
      case "clicked":
        return "bg-primary/80";
      case "too-early":
        return "bg-accent";
      default:
        return "bg-secondary";
    }
  };

  const getMessage = () => {
    switch (gameState) {
      case "idle":
        return {
          title: "Clique para Iniciar",
          subtitle: "Teste seu tempo de reação",
        };
      case "waiting":
        return {
          title: "Aguarde...",
          subtitle: "Espere a tela ficar verde",
        };
      case "ready":
        return {
          title: "CLIQUE!",
          subtitle: "Agora!",
        };
      case "clicked":
        return {
          title: `${reactionTime}ms`,
          subtitle:
            attempts.length < 5
              ? `Tentativa ${attempts.length}/5 - Clique para continuar`
              : "Resultado final calculado!",
        };
      case "too-early":
        return {
          title: "Muito Cedo!",
          subtitle: "Clique para tentar novamente",
        };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const message = getMessage();
  const avgTime =
    attempts.length > 0
      ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
      : null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div
        onClick={handleClick}
        className={cn(
          "relative w-full aspect-[16/9] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 select-none border border-border",
          getBackgroundClass()
        )}
      >
        <h2
          className={cn(
            "text-4xl md:text-6xl font-bold tracking-wider",
            gameState === "ready" || gameState === "clicked"
              ? "text-primary-foreground"
              : "text-foreground"
          )}
        >
          {message.title}
        </h2>
        <p
          className={cn(
            "text-lg md:text-xl mt-2",
            gameState === "ready" || gameState === "clicked"
              ? "text-primary-foreground/80"
              : "text-muted-foreground"
          )}
        >
          {message.subtitle}
        </p>
      </div>

      {attempts.length > 0 && (
        <div className="bg-secondary/30 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Tentativas</span>
            <button
              onClick={resetGame}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Reiniciar
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {attempts.map((time, index) => (
              <div
                key={index}
                className="bg-secondary px-3 py-1 rounded text-sm"
              >
                {time}ms
              </div>
            ))}
            {Array.from({ length: 5 - attempts.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-secondary/50 px-3 py-1 rounded text-sm text-muted-foreground border border-dashed border-border"
              >
                ---
              </div>
            ))}
          </div>

          {avgTime && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-muted-foreground text-sm">Tempo Médio:</span>
              <span className="text-xl font-bold text-primary">
                {avgTime}ms
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
