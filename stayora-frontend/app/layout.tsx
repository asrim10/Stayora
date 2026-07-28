import type { Metadata } from "next";
import { Geist_Mono, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import PageTransition from "./(public)/_components/PageTransition";

const headingFont = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sansFont = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stayora",
  description: "Book your dream hotel.",
  icons: "/images/logo.png",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${sansFont.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <PageTransition>
          <AuthProvider>
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
          </AuthProvider>
        </PageTransition>
      </body>
    </html>
  );
}
