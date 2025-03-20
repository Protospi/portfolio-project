import type { Metadata } from 'next'
import './globals.css'
import { I18nextProvider } from './providers/I18nextProvider'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <I18nextProvider>
          {children}
        </I18nextProvider>
      </body>
    </html>
  )
}
