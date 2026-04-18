"use client";
import { useLang } from "@/lib/LanguageContext";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-base">S</span>
              </div>
              <div>
                <span className="font-black text-xl text-white">Simba</span>
                <span className="block text-[10px] text-red-400 font-medium -mt-1">SUPERMARKET</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {t.tagline}. Shop over 552 products across 9 categories — all in Rwandan Francs.
            </p>
            <div className="flex flex-col gap-2 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{t.footer.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+250 788 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>hello@simbasupermarket.rw</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-white mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              {["Cosmetics & Personal Care", "Alcoholic Drinks", "Food Products", "Cleaning & Sanitary", "Baby Products"].map((cat) => (
                <li key={cat}>
                  <Link href={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-red-400 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold text-white mb-3">Info</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-red-400 transition-colors">{t.footer.about}</Link></li>
              <li><Link href="#" className="hover:text-red-400 transition-colors">{t.footer.contact}</Link></li>
              <li><Link href="#" className="hover:text-red-400 transition-colors">{t.footer.terms}</Link></li>
              <li><Link href="#" className="hover:text-red-400 transition-colors">{t.footer.privacy}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2024 Simba Supermarket. {t.footer.rights}.</p>
          <p>Built with ❤️ in Rwanda</p>
        </div>
      </div>
    </footer>
  );
}
