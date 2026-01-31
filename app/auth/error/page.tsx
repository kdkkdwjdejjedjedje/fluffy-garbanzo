import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle } from 'lucide-react'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

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
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                <AlertTriangle className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl font-[var(--font-orbitron)]">
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error ? (
                <p className="text-sm text-muted-foreground font-[var(--font-share-tech)]">
                  Erro: {params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground font-[var(--font-share-tech)]">
                  Ocorreu um erro não especificado.
                </p>
              )}
              <Link 
                href="/auth/login" 
                className="inline-block mt-6 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-[var(--font-share-tech)]"
              >
                Tentar novamente
              </Link>
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
