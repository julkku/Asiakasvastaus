import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asiakasvastaus",
  description: "Secure email and password authentication for Asiakasvastaus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <div className="min-h-screen">
          {children}
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 text-sm text-slate-600">
              <Link className="hover:text-slate-900" href="/terms">
                Käyttöehdot
              </Link>
              <Link className="hover:text-slate-900" href="/privacy">
                Tietosuojaseloste
              </Link>
              <Link className="hover:text-slate-900" href="/company">
                Yrityksen tiedot
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
