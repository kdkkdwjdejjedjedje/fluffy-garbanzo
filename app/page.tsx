"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Header } from "@/components/header";
import { ReactionGame } from "@/components/reaction-game";
import { Leaderboard } from "@/components/leaderboard";
import Link from "next/link";
import { Save, Check, Loader2 } from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [finalResult, setFinalResult] = useState<number | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const pendingResultRef = useRef<number | null>(null);

  const saveResult = useCallback(async (reactionTime: number, currentUser: User) => {
    setSaving(true);
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("reaction_records")
      .insert({
        user_id: currentUser.id,
        reaction_time: reactionTime,
      });

    if (insertError) {
      console.error("Error saving result:", insertError);
      setSaving(false);
      return false;
    }

    const { data: records } = await supabase
      .from("reaction_records")
      .select("reaction_time")
      .eq("user_id", currentUser.id);

    if (records && records.length > 0) {
      const times = records.map((r) => r.reaction_time);
      const bestTime = Math.min(...times);
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

      await supabase
        .from("profiles")
        .update({
          best_time: bestTime,
          average_time: avgTime,
          total_attempts: records.length,
        })
        .eq("id", currentUser.id);
    }

    setSaving(false);
    setResultSaved(true);
    pendingResultRef.current = null;
    setRefreshKey((prev) => prev + 1);
    return true;
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Se tem resultado pendente e usuario logou, salvar automaticamente
      if (user && pendingResultRef.current && !resultSaved) {
        saveResult(pendingResultRef.current, user);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      // Se usuario acabou de logar e tem resultado pendente, salvar
      if (newUser && pendingResultRef.current && !resultSaved) {
        saveResult(pendingResultRef.current, newUser);
      }
    });

    return () => subscription.unsubscribe();
  }, [saveResult, resultSaved]);

  const handleResult = useCallback(async (avgTime: number) => {
    setFinalResult(avgTime);
    setResultSaved(false);
    pendingResultRef.current = avgTime;

    // Se logado, salvar automaticamente
    if (user) {
      await saveResult(avgTime, user);
    }
  }, [user, saveResult]);

  const handleManualSave = useCallback(async () => {
    if (finalResult && user) {
      await saveResult(finalResult, user);
    }
  }, [finalResult, user, saveResult]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 tracking-wide">
            Teste seu <span className="text-primary">Tempo de Reação</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Complete 5 tentativas para calcular sua média e entre no ranking!
          </p>
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <ReactionGame onResult={handleResult} isLoggedIn={!!user} />

            {finalResult && !resultSaved && !user && (
              <div className="text-center p-4 bg-secondary/50 border border-border rounded-lg">
                <p className="text-foreground mb-3">
                  Seu resultado: <span className="text-primary font-bold text-xl">{finalResult}ms</span>
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  Faça login para salvar no ranking!
                </p>
                <div className="flex justify-center gap-3">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors text-sm"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded transition-colors text-sm"
                  >
                    Criar Conta
                  </Link>
                </div>
              </div>
            )}

            {finalResult && !resultSaved && user && !saving && (
              <div className="flex justify-center">
                <button
                  onClick={handleManualSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Salvar no Ranking
                </button>
              </div>
            )}

            {saving && (
              <div className="flex justify-center items-center gap-2 p-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Salvando...</span>
              </div>
            )}

            {resultSaved && (
              <div className="flex justify-center items-center gap-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-primary">Resultado salvo! Confira o ranking.</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Leaderboard key={refreshKey} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-4">
        <p className="text-center text-xs text-muted-foreground">
          PRO Reaction Test
        </p>
      </footer>
    </div>
  );
}
