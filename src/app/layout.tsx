import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SimbaAssistant from "@/components/SimbaAssistant";
import BranchModal from "@/components/BranchModal";
import HtmlLang from "@/components/HtmlLang";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "Simba Supermarket — Rwanda's Online Supermarket",
  description: "Shop groceries, cosmetics, drinks & more. Fast delivery in Kigali, Rwanda.",
  keywords: "Rwanda supermarket, Kigali grocery, online shopping Rwanda, Simba supermarket",
  icons: {
    icon: "/images/simba-logo.jpeg",
    shortcut: "/images/simba-logo.jpeg",
    apple: "/images/simba-logo.jpeg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
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
        </Providers>
      </body>
    </html>
  );
}
