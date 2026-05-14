import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SimbaAssistant from "@/components/SimbaAssistant";
import BranchModal from "@/components/BranchModal";
import HtmlLang from "@/components/HtmlLang";
import MobileBottomNav from "@/components/MobileBottomNav";
import ServiceWorker from "@/components/ServiceWorker";

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export const metadata: Metadata = {
  title: "Simba Supermarket — Rwanda's Online Supermarket",
  description: "Shop groceries, cosmetics, drinks & more. Fast delivery in Kigali, Rwanda.",
  keywords: "Rwanda supermarket, Kigali grocery, online shopping Rwanda, Simba supermarket",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-180x180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIMBA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Providers>
          <HtmlLang />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <SimbaAssistant />
          <BranchModal />
          <MobileBottomNav />
          <ServiceWorker />
        </Providers>
      </body>
    </html>
  );
}
