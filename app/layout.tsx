import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContextCollab",
  description: "Private AI chats. Shared team context.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
