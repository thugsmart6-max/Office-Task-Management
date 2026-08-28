import type { Metadata, Viewport } from "next";
import { Archivo_Black, DM_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const copy = DM_Sans({
  variable: "--font-copy",
  subsets: ["latin"],
});

const grand = Archivo_Black({
  variable: "--font-grand",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Office Tasks",
  description: "Assign work, track progress, get it done.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${copy.variable} ${grand.variable} h-full overflow-x-clip antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:'light'}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh overflow-x-clip bg-bg text-fg [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
