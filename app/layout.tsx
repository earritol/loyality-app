import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "GANA — GanaMás Club",
  description: "Gana recompensas en tus negocios locales favoritos. Registra visitas, canjea premios.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
}

// Inline script that runs before React hydration to set theme class.
// Priority: cookie > system preference > light
const themeScript = `(function(){
  var c=document.cookie.match(/(?:^|; )theme=([^;]*)/);
  var t=c?c[1]:null;
  if(!t){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}
  if(t==='dark'){document.documentElement.classList.add('dark')}
  else{document.documentElement.classList.remove('dark')}
})();`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value
  // Server hint: if cookie exists use it, otherwise don't add dark class
  // (the inline script will handle system preference on the client)
  const serverDark = themeCookie === 'dark'

  return (
    <html lang="es" className={`${inter.variable} h-full antialiased ${serverDark ? 'dark' : ''}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
