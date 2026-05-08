import type { Metadata, Viewport } from "next"
import { Inter, Geist } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"
import { RegisterServiceWorker } from "@/components/pwa/register-sw"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { cn } from "@/lib/utils"

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "GANA — GanaMás Club",
  description: "Gana recompensas en tus negocios locales favoritos. Registra visitas, canjea premios.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GanaMás",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1F2937",
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
    <html lang="es" suppressHydrationWarning className={cn("h-full", "antialiased", inter.variable, serverDark ? 'dark' : '', "font-sans", geist.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <RegisterServiceWorker />
        <InstallPrompt />
        {children}
      </body>
    </html>
  )
}
