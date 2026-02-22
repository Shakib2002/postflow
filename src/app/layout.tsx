import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { SentryErrorBoundary } from "@/components/providers/error-boundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Safe metadataBase URL parsing
const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL || "https://postflow.app";
  if (url.startsWith("http")) return new URL(url);
  return new URL(`https://${url}`);
};

export const metadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: {
    default: "PostFlow — Social Media Automation Platform",
    template: "%s | PostFlow",
  },
  description:
    "The most powerful social media automation platform. Schedule posts, capture leads, and grow your audience on LinkedIn, Facebook, Twitter, Instagram and more — all from one dashboard.",
  keywords: [
    "social media automation",
    "post scheduler",
    "lead generation",
    "LinkedIn automation",
    "content calendar",
    "AI social media",
    "social media management",
  ],
  openGraph: {
    title: "PostFlow — Social Media Automation Platform",
    description: "Automate your social media, capture leads, and grow faster with AI-powered scheduling and analytics.",
    type: "website",
    url: "/",
    siteName: "PostFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PostFlow — Social Media Automation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostFlow — Social Media Automation Platform",
    description: "Automate your social media, capture leads, and grow faster.",
    images: ["/og-image.png"],
    creator: "@postflow",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PostFlow" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <PostHogProvider>
          <SentryErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </SentryErrorBoundary>
        </PostHogProvider>
      </body>
    </html>
  );
}
