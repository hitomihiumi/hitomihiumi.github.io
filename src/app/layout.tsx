import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HitomiHiumi",
  description: "HitomiHiumi's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="icon" href="favicon.ico"/>
      <title>HitomiHiumi</title>
    </head>
    <body className={inter.className}>{children}</body>
    </html>
  );
}
