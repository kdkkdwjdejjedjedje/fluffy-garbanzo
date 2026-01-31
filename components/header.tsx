"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { LogOut, User as UserIcon } from "lucide-react";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/icon-pro-guild-novo-1-photoroom.png"
            alt="PRO Logo"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-xl font-bold tracking-wider">
              PRO <span className="text-primary">Reaction</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Teste de Reflexo
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-8 bg-secondary animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[150px]">
                {user.user_metadata?.username || user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded transition-colors text-sm"
              >
                Entrar
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors text-sm"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
