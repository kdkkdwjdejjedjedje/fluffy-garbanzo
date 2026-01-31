import React from "react"
import type { Metadata } from 'next'
import { Orbitron, Share_Tech_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const orbitron = Orbitron({ subsets: ["latin"], variable: '--font-orbitron' });
const shareTechMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: '--font-share-tech' });

export const metadata: Metadata = {
  title: 'PRO Reaction Test - Teste seu Reflexo',
  description: 'Teste de tempo de reação estilo gamer. Desafie seus amigos e veja quem tem o reflexo mais rápido!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${shareTechMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
