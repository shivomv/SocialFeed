import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

// Load fonts with display: swap for better performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Enhanced metadata for better SEO
export const metadata = {
  title: "SocialFeed - Share Your Thoughts With The World",
  description: "Join our community and connect with people from around the globe. Share your ideas, photos, and experiences on SocialFeed.",
  keywords: ["social media", "community", "sharing", "posts", "social network"],
  authors: [{ name: "SocialFeed Team" }],
  openGraph: {
    title: "SocialFeed - Share Your Thoughts With The World",
    description: "Join our community and connect with people from around the globe. Share your ideas, photos, and experiences.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://socialfeed.vercel.app",
    siteName: "SocialFeed",
    images: [
      {
        url: "/app-screenshot.png",
        width: 1200,
        height: 630,
        alt: "SocialFeed Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialFeed - Share Your Thoughts With The World",
    description: "Join our community and connect with people from around the globe. Share your ideas, photos, and experiences.",
    images: ["/app-screenshot.png"],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: "index, follow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Add favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>

        {/* Error monitoring script - optional, add your preferred error monitoring service */}
        <Script
          id="error-monitoring"
          strategy="afterInteractive"
        >
          {`
            window.addEventListener('error', function(e) {
              console.error('Global error caught:', e.error);
              // You could send this to your error monitoring service
            });
          `}
        </Script>
      </body>
    </html>
  );
}
