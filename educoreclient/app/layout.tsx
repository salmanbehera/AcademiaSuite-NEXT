import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientProviders } from "@/app/components/ClientProviders";
 
import "./globals.css";


import { RouteChangeSpinner } from "@/app/components/RouteChangeSpinner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AcademiaSuite - Education Management System",
  description: "Complete education management solution for schools and colleges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
           
          <RouteChangeSpinner />
          <div className="flex">
            <main className="flex-1">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
