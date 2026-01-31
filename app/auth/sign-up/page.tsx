'use client'

import React from "react"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (username.length < 3) {
      setError('O nome de usuário deve ter pelo menos 3 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/`,
          data: {
            username: username,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/images/icon-pro-guild-novo-1-photoroom.png"
              alt="PRO Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold font-[var(--font-orbitron)] tracking-wider">
                PRO <span className="text-primary">Reaction</span>
              </h1>
            </div>
          </Link>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl font-[var(--font-orbitron)]">Criar Conta</CardTitle>
              <CardDescription className="font-[var(--font-share-tech)]">Crie sua conta para entrar no ranking</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="font-[var(--font-share-tech)]">Nome de Usuário</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="seu_nome"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-[var(--font-share-tech)]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password" className="font-[var(--font-share-tech)]">Senha</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="repeat-password" className="font-[var(--font-share-tech)]">Repetir Senha</Label>
                    </div>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  {error && <p className="text-sm text-accent">{error}</p>}
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm font-[var(--font-share-tech)]">
                  Já tem uma conta?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary underline underline-offset-4"
                  >
                    Entrar
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground font-[var(--font-share-tech)]">
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
