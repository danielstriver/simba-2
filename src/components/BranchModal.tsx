"use client";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { useToast } from "@/components/Toast";
import { BRANCHES } from "@/lib/branches";
import { X, Store, MapPin, Check, Info } from "lucide-react";
import { useEffect, useState } from "react";

export default function BranchModal() {
  const { t } = useLang();
  const { toast } = useToast();
  const { selectedBranch, setSelectedBranch, showBranchModal, setShowBranchModal } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const branches = BRANCHES;

  if (!mounted || !showBranchModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowBranchModal(false)} />
      
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/50">
            <Store className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
            Select Pickup Branch
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed max-w-[280px] mx-auto">
            Please choose a location to check stock availability and prepare your order.
          </p>
          <button 
            onClick={() => setShowBranchModal(false)}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch List */}
        <div className="px-4 pb-4 max-h-[50vh] overflow-y-auto space-y-2 scrollbar-thin">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => { 
                setSelectedBranch(b.id); 
                setShowBranchModal(false);
                toast(`Ready at ${b.label}`, "success", "Items are being checked for availability.");
              }}
              className={`w-full flex items-start gap-4 p-5 rounded-3xl border-2 text-left transition-all ${
                selectedBranch === b.id 
                  ? "border-red-600 bg-red-50 dark:bg-red-950/50" 
                  : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedBranch === b.id ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm ${selectedBranch === b.id ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{b.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{b.addr}</p>
              </div>
              {selectedBranch === b.id && (
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                  <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-3 items-start">
            <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
              <strong>Simulated Inventory:</strong> Not all items are available at every branch. By selecting a location, we verify that your items can be prepared correctly at that specific counter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
