import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CurrentMemberProvider } from "@/context/CurrentMemberContext";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"], variable: '--font-body' });
const manrope = Manrope({ subsets: ["latin"], variable: '--font-headline' });

export const metadata: Metadata = {
  title: "Seattle Steel Pan Project",
  description: "Gig availability, roster, and setlists for the Seattle Steel Pan Project.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Steel Pan", statusBarStyle: "default" },
};

// viewportFit is what makes env(safe-area-inset-*) resolve to real values on
// notched phones — without it the bottom nav sits under the home indicator.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3b683f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${manrope.variable} font-body antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <CurrentMemberProvider>
              {children}
            </CurrentMemberProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
