import type { Metadata } from "next";
import { Rajdhani, Orbitron } from "next/font/google";
import "./app.css";

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
      </head>
      <body
        className={`${rajdhani.variable} ${orbitron.variable} font-cyber antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
