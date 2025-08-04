import type { Metadata } from "next";
import { Rajdhani, Orbitron } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BroVerse RAG | Ultimate Knowledge Intelligence Platform",
  description: "The cutting-edge AI-powered knowledge intelligence platform that transforms how bros access and interact with information. Featuring advanced RAG capabilities, real-time analytics, and a cyber-tech interface.",
  keywords: ["AI", "RAG", "Knowledge Management", "Machine Learning", "Vector Database", "Document Intelligence"],
  authors: [{ name: "BroVerse Team" }],
  creator: "BroVerse",
  publisher: "BroVerse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://broverse-rag.com'),
  openGraph: {
    title: "BroVerse RAG - Ultimate Knowledge Intelligence Platform",
    description: "The cutting-edge AI-powered knowledge intelligence platform",
    url: 'https://broverse-rag.com',
    siteName: 'BroVerse RAG',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BroVerse RAG',
    description: 'The cutting-edge AI-powered knowledge intelligence platform',
    creator: '@broverse',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-rajdhani: ${rajdhani.style.fontFamily};
            --font-orbitron: ${orbitron.style.fontFamily};
          }
          body {
            background-color: #0A0A0F !important;
            color: #E0F2FE !important;
            font-family: ${rajdhani.style.fontFamily}, sans-serif !important;
            background-image: 
              radial-gradient(circle at 25% 25%, rgba(0, 217, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
              linear-gradient(rgba(0, 217, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 217, 255, 0.05) 1px, transparent 1px) !important;
            background-size: 100% 100%, 100% 100%, 50px 50px, 50px 50px !important;
            background-attachment: fixed !important;
          }
          .text-neon-cyan { color: #00D9FF !important; }
          .text-neon-purple { color: #FF00FF !important; }
          .text-neon-lime { color: #00FF88 !important; }
          .text-neon-pink { color: #FF0080 !important; }
          .text-neon-blue { color: #0080FF !important; }
          .bg-neon-cyan { background-color: #00D9FF !important; }
          .bg-neon-purple { background-color: #FF00FF !important; }
          .bg-neon-lime { background-color: #00FF88 !important; }
          .bg-neon-pink { background-color: #FF0080 !important; }
          .bg-neon-blue { background-color: #0080FF !important; }
          .font-tech { font-family: ${orbitron.style.fontFamily}, monospace !important; }
          .font-cyber { font-family: ${rajdhani.style.fontFamily}, sans-serif !important; }
        ` }} />
      </head>
      <body
        className={`${rajdhani.variable} ${orbitron.variable} font-cyber antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
