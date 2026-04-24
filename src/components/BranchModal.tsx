"use client";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { useToast } from "@/components/Toast";
import { BRANCHES } from "@/lib/branches";
import { X, MapPin, Check, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const DISTRICTS = ["All", "Nyarugenge", "Gasabo", "Kicukiro"] as const;
type DistrictFilter = typeof DISTRICTS[number];

const DISTRICT_COLORS = {
  Nyarugenge: {
    stripe: "bg-orange-500",
    badge: "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300",
    phone: "text-orange-600 dark:text-orange-400",
  },
  Gasabo: {
    stripe: "bg-emerald-500",
    badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
    phone: "text-emerald-600 dark:text-emerald-400",
  },
  Kicukiro: {
    stripe: "bg-blue-500",
    badge: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
    phone: "text-blue-600 dark:text-blue-400",
  },
} as const;

export default function BranchModal() {
  const { t } = useLang();
  const { toast } = useToast();
  const { selectedBranch, setSelectedBranch, showBranchModal, setShowBranchModal } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<DistrictFilter>("All");

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !showBranchModal) return null;

  const filtered = filter === "All" ? BRANCHES : BRANCHES.filter((b) => b.district === filter);
  const countOf = (d: string) => BRANCHES.filter((b) => b.district === d).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setShowBranchModal(false)}
      />

      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-400">

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-5 pt-4 pb-4">
          {/* Mobile drag pill */}
          <div className="sm:hidden w-10 h-1 rounded-full bg-white/30 mx-auto mb-3" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-white leading-none">{t.selectBranch}</h3>
              <p className="text-orange-100 text-[11px] mt-0.5">11 locations across Kigali</p>
            </div>
            <button
              onClick={() => setShowBranchModal(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* District filter tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {DISTRICTS.map((d) => {
              const count = d === "All" ? BRANCHES.length : countOf(d);
              const active = filter === d;
              return (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    active
                      ? "bg-white text-orange-700 shadow-sm"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {d}
                  <span className={`text-[10px] ${active ? "text-orange-400" : "text-white/60"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Branch list */}
        <div className="max-h-[52vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((b) => {
            const colors = DISTRICT_COLORS[b.district];
            const selected = selectedBranch === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBranch(b.id);
                  setShowBranchModal(false);
                  toast(`Ready at ${b.label}`, "success", "Items are being checked for availability.");
                }}
                className={`w-full flex items-stretch text-left transition-colors ${
                  selected
                    ? "bg-orange-50 dark:bg-orange-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {/* District color stripe */}
                <div className={`w-1 shrink-0 ${colors.stripe} ${selected ? "opacity-100" : "opacity-25"}`} />

                <div className="flex items-center gap-3 flex-1 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-black ${selected ? "text-orange-700 dark:text-orange-400" : "text-gray-900 dark:text-white"}`}>
                        {b.label}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.badge}`}>
                        {b.district.slice(0, 3)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">{b.addr}</p>
                    {b.phone && (
                      <div className={`flex items-center gap-1 mt-0.5 ${colors.phone}`}>
                        <Phone className="w-2.5 h-2.5" />
                        <span className="text-[11px] font-medium">{b.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Radio */}
                  <div className={`w-5 h-5 rounded-full shrink-0 border-2 flex items-center justify-center transition-all ${
                    selected
                      ? "bg-orange-600 border-orange-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}>
                    {selected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
            Stock is verified per branch · Inventory may vary by location
          </p>
        </div>
      </div>
    </div>
  );
}
