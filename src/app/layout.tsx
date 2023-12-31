import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "normalize.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Go Room',
  description: 'Small 3D Go App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
