import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProviderWrapper } from "./providers/google-oauth-provider";
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
  title: "Bolingo",
  description: "Authentification hybride — Google, SMS et Email OTP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleOAuthProviderWrapper>{children}</GoogleOAuthProviderWrapper>
      </body>
    </html>
  );
}
