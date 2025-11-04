import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voice-Controlled Smart Workspace',
  description: 'Manage tasks using voice commands',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
