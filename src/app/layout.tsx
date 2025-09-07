import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Chat overlay | hitomihiumi.xyz",
  description: "Twitch chat overlay for streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className="h-screen w-screen overflow-auto m-0 p-0 text-black font-sans text-xl">
        <Script
          src="/tmi.min.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
