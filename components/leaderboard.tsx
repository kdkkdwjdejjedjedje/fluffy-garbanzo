"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  best_time: number;
  average_time: number;
  total_attempts: number;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"best_time" | "average_time">(
    "best_time"
  );

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, best_time, average_time, total_attempts")
        .not("best_time", "is", null)
        .order(sortBy, { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
        return;
      }

      setEntries(data || []);
      setLoading(false);
    }

    fetchLeaderboard();
  }, [sortBy]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm text-muted-foreground">
            {position + 1}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-secondary rounded w-1/3" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Ranking
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setSortBy("best_time")}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              sortBy === "best_time"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Melhor
          </button>
          <button
            onClick={() => setSortBy("average_time")}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              sortBy === "average_time"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Média
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm">
          <p>Nenhum resultado ainda.</p>
          <p className="text-xs mt-1">Seja o primeiro!</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 transition-colors hover:bg-secondary/50 ${
                index < 3 ? "bg-secondary/30" : ""
              }`}
            >
              <div className="w-6 flex justify-center">
                {getRankIcon(index)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">
                  {entry.username || "Anônimo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.total_attempts} jogos
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">
                  {sortBy === "best_time"
                    ? entry.best_time
                    : entry.average_time}
                  ms
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
