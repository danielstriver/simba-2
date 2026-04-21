import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SimbaAssistant from "@/components/SimbaAssistant";
import HtmlLang from "@/components/HtmlLang";

export const metadata: Metadata = {
  title: "Simba Supermarket — Rwanda's Online Supermarket",
  description: "Shop groceries, cosmetics, drinks & more. Fast delivery in Kigali, Rwanda.",
  keywords: "Rwanda supermarket, Kigali grocery, online shopping Rwanda, Simba supermarket",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>
            <HtmlLang />
            <ToastProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <CartDrawer />
              <SimbaAssistant />
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
