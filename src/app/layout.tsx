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
          
          /* Color utilities */
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
          
          /* Layout fixes */
          .border-primary\\/20 { border-color: rgba(0, 217, 255, 0.2) !important; }
          .border-primary\\/30 { border-color: rgba(0, 217, 255, 0.3) !important; }
          .backdrop-blur { backdrop-filter: blur(20px) !important; }
          .backdrop-blur-xl { backdrop-filter: blur(24px) !important; }
          
          /* Card styling */
          .bg-card\\/50 { background-color: rgba(15, 15, 20, 0.5) !important; }
          .bg-card\\/80 { background-color: rgba(15, 15, 20, 0.8) !important; }
          .bg-background\\/80 { background-color: rgba(10, 10, 15, 0.8) !important; }
          .bg-black\\/80 { background-color: rgba(0, 0, 0, 0.8) !important; }
          .bg-black\\/90 { background-color: rgba(0, 0, 0, 0.9) !important; }
          
          /* Border utilities */
          .border { border-width: 1px !important; }
          .border-b { border-bottom-width: 1px !important; }
          .border-r { border-right-width: 1px !important; }
          .rounded-lg { border-radius: 0.5rem !important; }
          .rounded-full { border-radius: 9999px !important; }
          
          /* Spacing */
          .p-2 { padding: 0.5rem !important; }
          .p-4 { padding: 1rem !important; }
          .p-6 { padding: 1.5rem !important; }
          .p-8 { padding: 2rem !important; }
          .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
          .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
          .py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
          .gap-2 { gap: 0.5rem !important; }
          .gap-3 { gap: 0.75rem !important; }
          .gap-4 { gap: 1rem !important; }
          .space-y-2 > * + * { margin-top: 0.5rem !important; }
          .space-y-3 > * + * { margin-top: 0.75rem !important; }
          .space-y-4 > * + * { margin-top: 1rem !important; }
          
          /* Flexbox */
          .flex { display: flex !important; }
          .flex-col { flex-direction: column !important; }
          .items-center { align-items: center !important; }
          .justify-between { justify-content: space-between !important; }
          .justify-center { justify-content: center !important; }
          
          /* Hover effects */
          button:hover { filter: brightness(1.2); transition: all 0.3s ease; }
          
          /* Typography */
          .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
          .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
          .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
          .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
          .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
          .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
          .text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; }
          .font-medium { font-weight: 500 !important; }
          .font-semibold { font-weight: 600 !important; }
          .font-bold { font-weight: 700 !important; }
          .uppercase { text-transform: uppercase !important; }
          .tracking-wider { letter-spacing: 0.05em !important; }
          
          /* Animations */
          .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite !important; }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          /* Shadows */
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 217, 255, 0.1), 0 4px 6px -2px rgba(0, 217, 255, 0.05) !important; }
          .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 217, 255, 0.1), 0 10px 10px -5px rgba(0, 217, 255, 0.04) !important; }
          
          /* Grid background fix */
          .cyber-grid {
            background-image: 
              linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px) !important;
            background-size: 50px 50px !important;
          }
          
          /* Badge styling */
          .bg-neon-lime\\/20 { background-color: rgba(0, 255, 136, 0.2) !important; }
          .bg-neon-cyan\\/20 { background-color: rgba(0, 217, 255, 0.2) !important; }
          .bg-neon-purple\\/20 { background-color: rgba(255, 0, 255, 0.2) !important; }
          .border-neon-lime\\/30 { border-color: rgba(0, 255, 136, 0.3) !important; }
          .border-neon-cyan\\/30 { border-color: rgba(0, 217, 255, 0.3) !important; }
          .border-neon-purple\\/30 { border-color: rgba(255, 0, 255, 0.3) !important; }
          
          /* Upload area styling */
          .border-dashed { border-style: dashed !important; }
          .border-2 { border-width: 2px !important; }
          
          /* Custom animations */
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(40px) translateY(-50%) rotate(0deg); }
            to { transform: rotate(360deg) translateX(40px) translateY(-50%) rotate(-360deg); }
          }
          
          @keyframes slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          
          @keyframes float-up {
            0% { transform: translateY(100vh) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
          }
          
          @keyframes scanline {
            0% { transform: translateY(0); }
            100% { transform: translateY(10px); }
          }
          
          @keyframes cyber-glow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(0, 217, 255, 0.5), inset 0 0 20px rgba(0, 217, 255, 0.1);
            }
            50% { 
              box-shadow: 0 0 40px rgba(255, 0, 255, 0.5), inset 0 0 40px rgba(255, 0, 255, 0.1);
            }
          }
          
          @keyframes neon-pulse {
            0% { 
              text-shadow: 0 0 5px #00D9FF, 0 0 10px #00D9FF, 0 0 15px #00D9FF;
              box-shadow: 0 0 5px #00D9FF;
            }
            100% { 
              text-shadow: 0 0 10px #00D9FF, 0 0 20px #00D9FF, 0 0 30px #00D9FF;
              box-shadow: 0 0 10px #00D9FF, 0 0 20px #00D9FF;
            }
          }
          
          /* Animation utilities */
          .animate-spin-slow { animation: spin 3s linear infinite; }
          .animate-spin-reverse { animation: spin 2s linear infinite reverse; }
          .animate-float { animation: float-up 30s linear infinite; }
          .animate-shimmer { animation: shimmer 2s infinite; }
          .animate-slide { animation: slide 2s ease-in-out infinite; }
          .animate-cyber-glow { animation: cyber-glow 3s ease-in-out infinite; }
          .animate-neon-pulse { animation: neon-pulse 2s ease-in-out infinite alternate; }
          
          /* Glass morphism */
          .glass {
            background: rgba(0, 0, 0, 0.4) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(0, 217, 255, 0.2) !important;
          }
          
          /* Neon glow text */
          .neon-glow {
            text-shadow: 
              0 0 10px currentColor,
              0 0 20px currentColor,
              0 0 30px currentColor,
              0 0 40px currentColor !important;
          }
          
          /* Cyber grid enhanced */
          .cyber-grid-animated {
            background-image: 
              linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(0, 217, 255, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 0, 255, 0.05) 0%, transparent 50%) !important;
            background-size: 50px 50px, 50px 50px, 100% 100%, 100% 100% !important;
            animation: cyber-grid-move 20s linear infinite !important;
          }
          
          @keyframes cyber-grid-move {
            0% { background-position: 0 0, 0 0, 0% 0%, 100% 100%; }
            100% { background-position: 50px 50px, 50px 50px, 100% 100%, 0% 0%; }
          }
          
          /* Enhanced buttons */
          .cyber-button {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          
          .cyber-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          .cyber-button:hover::before {
            left: 100%;
          }
          
          /* Card depth effect */
          .card-3d {
            transform-style: preserve-3d;
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
            transition: transform 0.6s;
          }
          
          .card-3d:hover {
            transform: perspective(1000px) rotateX(-10deg) rotateY(10deg);
          }
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
