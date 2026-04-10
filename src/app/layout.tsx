import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anteres AI | Founder Identity",
  description: "Solo founder AI intelligence engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col pt-16 relative">
          <header className="absolute top-0 w-full p-4 flex justify-end items-center px-8 z-50">
            <Show when="signed-out">
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-500 transition-colors cursor-pointer">
                  <SignInButton />
                </div>
                <div className="px-4 py-2 border border-slate-700 rounded-lg text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer">
                  <SignUpButton />
                </div>
              </div>
            </Show>
            <Show when="signed-in">
              <div className="bg-slate-900/50 p-2 rounded-full border border-slate-700/50 backdrop-blur-md">
                <UserButton />
              </div>
            </Show>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
