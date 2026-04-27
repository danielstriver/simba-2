"use client";
import { useLang } from "@/lib/LanguageContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

// English values used for URL query params — display labels come from i18n
const SHOP_CATEGORY_VALUES = [
  "Cosmetics & Personal Care",
  "Alcoholic Drinks",
  "Food Products",
  "Cleaning & Sanitary",
  "Baby Products",
];

export default function Footer() {
  const { t } = useLang();
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/staff")) return null;

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 md:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md shrink-0">
                <Image src="/images/simba-logo.jpeg" alt="Simba Supermarket" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-black text-xl text-white">Simba</span>
                <span className="block text-[10px] text-orange-400 font-medium -mt-1">SUPERMARKET</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {t.tagline}. Shop over 789 products across 10 categories — all in Rwandan Francs.
            </p>
            <div className="flex flex-col gap-2 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{t.footer.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+250 788 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>hello@simbasupermarket.rw</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-white mb-3">{t.footer.shop}</h4>
            <ul className="space-y-2 text-sm">
              {SHOP_CATEGORY_VALUES.map((cat, i) => (
                <li key={cat}>
                  <Link href={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-orange-400 transition-colors">
                    {t.footer.shopCategories[i]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold text-white mb-3">{t.footer.info}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-orange-400 transition-colors">{t.footer.about}</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">{t.footer.contact}</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">{t.footer.terms}</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">{t.footer.privacy}</Link></li>
              <li className="pt-2 border-t border-gray-800">
                <Link href="/staff/login" className="hover:text-orange-400 transition-colors text-gray-500 text-xs">
                  {t.staffPortal}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2026 Simba Supermarket. {t.footer.rights}.</p>
          <div className="flex items-center gap-3">
            <Link href="#" className="hover:text-gray-300 transition-colors">{t.footer.terms}</Link>
            <span className="text-gray-700">·</span>
            <Link href="#" className="hover:text-gray-300 transition-colors">{t.footer.privacy}</Link>
            <span className="text-gray-700">·</span>
            <Link href="#" className="hover:text-gray-300 transition-colors">{t.footer.about}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
