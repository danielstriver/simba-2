"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { getProducts, Product, formatPrice, CATEGORY_META, CATEGORIES } from "@/lib/products";
import { getProductImage } from "@/lib/imageMap";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { useLang } from "@/lib/LanguageContext";
import { quickSearch, extractQuery } from "@/lib/search";
import { useFocusTrap } from "@/lib/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle, X, Mic, MicOff, Send, ShoppingCart,
  Volume2, VolumeX, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  role: "assistant" | "user";
  text: string;
  products?: Product[];
  groq?: boolean;
}

// ─── Web Speech API types ─────────────────────────────────────────────────────
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

// ─── NLP: intent + entity extraction ─────────────────────────────────────────
function detectIntent(text: string): { intent: string; query: string } {
  const t = text.toLowerCase().trim();

  if (/^(hi|hello|hey|muraho|bonjour|salut|good morning|good afternoon|good evening|howdy|yo\b|sup\b|how are you|how'?s it going|how are things|how do you do|how'?s everything|what'?s up|wassup|wazzup)/.test(t))
    return { intent: "greeting", query: "" };

  // "thanks" family — safe as prefix; nobody searches "thanks for shampoo"
  if (/^(thanks|thank you|thx\b|ty\b|cheers|merci|appreciate it|much appreciated|that('s| is) (great|helpful|perfect|awesome|useful|wonderful|brilliant)|that helped|very helpful|noted\b)/.test(t))
    return { intent: "thanks", query: "" };

  // Short acknowledgments — exact-match only to avoid "great wine", "cool shampoo"
  if (/^(awesome|great|perfect|cool|nice|ok|okay|got it|sounds good|alright|sure|love it|brilliant|wonderful|superb)$/.test(t))
    return { intent: "thanks", query: "" };

  // Farewells
  if (/^(bye|goodbye|see you|ciao|au revoir|good night|goodnight|take care|later\b)/.test(t))
    return { intent: "farewell", query: "" };

  if (/\b(who are you|what are you|tell me about yourself|your name|what'?s your name|introduce yourself)\b/.test(t))
    return { intent: "identity", query: "" };

  if (/\b(help|what can you|what do you do|commands|options|how do you work)\b/.test(t))
    return { intent: "help", query: "" };

  if (/\b(my cart|my basket|my order|what('s| is) in my cart|how many.*(cart|basket)|cart total|checkout)\b/.test(t))
    return { intent: "cart", query: "" };

  if (/\b(cheapest|lowest price|most affordable|budget|least expensive|best deal|best price)\b/.test(t)) {
    const q = extractQuery(t.replace(/cheapest|lowest price|most affordable|budget|least expensive|best deal|best price/g, ""));
    return { intent: "cheapest", query: q };
  }

  if (/\b(most expensive|priciest|premium|luxury|highest price|top of the range)\b/.test(t)) {
    const q = extractQuery(t.replace(/most expensive|priciest|premium|luxury|highest price|top of the range/g, ""));
    return { intent: "expensive", query: q };
  }

  if (/\b(how much (is|does|for|are)|price of|cost of|what('s| is) the price|what does .* cost|how much .* cost)\b/.test(t)) {
    const q = extractQuery(t.replace(/how much (is|does|for|are)|the price of|cost of|what('?s| is) the price of?|what does|cost|price/g, ""));
    return { intent: "price", query: q };
  }

  if (/\b(show all|browse|list all|all categories|what categories|what do you (have|sell|carry|stock))\b/.test(t)) {
    for (const cat of CATEGORIES) {
      const first = cat.toLowerCase().split(" ")[0];
      if (t.includes(first)) return { intent: "category", query: cat };
    }
    return { intent: "categories", query: "" };
  }

  // Try to match a category directly
  for (const cat of CATEGORIES) {
    if (t.includes(cat.toLowerCase())) return { intent: "category", query: cat };
  }

  // Default: treat everything else as a product search
  const q = extractQuery(t);
  return { intent: "search", query: q || t };
}

// Common English words that are too generic to search on
const STOP_WORDS = new Set(["the","and","for","with","from","that","this","are","was","have","has","had","not","but","they","will","would","could","should","been","being","its","your","our","their","you","all","any","get","can","may","use","one","two","three","four","five"]);

// ─── Fallback: broaden a failed search by trying each word individually ───────
function broadSearch(query: string, products: Product[]): Product[] {
  const words = query.split(/\s+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  for (const word of words) {
    const r = quickSearch(word, products, 5);
    if (r.length > 0) return r;
  }
  return [];
}

// ─── Response generator ───────────────────────────────────────────────────────
function buildResponse(
  intent: string,
  query: string,
  products: Product[],
  cartItems: number,
  cartTotal: number
): { text: string; results: Product[] } {
  switch (intent) {
    case "greeting":
      return {
        text: "Hey there! 👋 I'm **SIMBA**, your shopping assistant. I can find products, check prices, or browse any category for you.\n\nWhat are you looking for today?",
        results: [],
      };

    case "thanks":
      return {
        text: "Happy to help! 😊 Let me know if you need anything else — I can find products, check prices, or browse categories for you.",
        results: [],
      };

    case "farewell":
      return {
        text: "Take care! 👋 Come back anytime you need help finding something at Simba Supermarket.",
        results: [],
      };

    case "identity":
      return {
        text: "I'm **SIMBA**, Simba Supermarket's shopping assistant! 🦁\n\nI know all 789 products in the store and can help you:\n• Find specific items\n• Check prices\n• Browse categories\n\nWhat would you like to shop for today?",
        results: [],
      };

    case "help":
      return {
        text: `Here's what I can help with:\n\n• **Find products** — "Got shampoo?" or "Find me honey"\n• **Price check** — "How much is Amarula?"\n• **Best deals** — "Cheapest wine" or "Most affordable soap"\n• **Browse** — "Show food products" or "What categories do you have?"\n• **Cart** — "What's in my cart?"\n\nJust ask naturally — I'll understand! 🛒`,
        results: [],
      };

    case "cart":
      if (cartItems === 0)
        return { text: "Your cart is empty right now. Want me to help you find something? 🛍️", results: [] };
      return {
        text: `You have **${cartItems} item${cartItems > 1 ? "s" : ""}** in your cart, totalling **${formatPrice(cartTotal)}**. Head to checkout when you're ready!`,
        results: [],
      };

    case "categories":
      return {
        text: `We carry products across **${CATEGORIES.length} categories**:\n\n${CATEGORIES.map((c) => `${CATEGORY_META[c]?.icon || "🛒"} **${c}**`).join("\n")}\n\nJust name any category and I'll show you what's available!`,
        results: [],
      };

    case "category": {
      const matched = products.filter((p) => p.category.toLowerCase().includes(query.toLowerCase()));
      const shown = matched.slice(0, 5);
      if (shown.length === 0)
        return { text: `Hmm, I couldn't find products in **"${query}"**. Try asking me to "show all categories".`, results: [] };
      return {
        text: `We have **${matched.length} products** in **${query}**. Here's a sample:`,
        results: shown,
      };
    }

    case "cheapest": {
      const pool = query ? quickSearch(query, products, 50) : products;
      if (pool.length === 0) {
        const broad = broadSearch(query, products);
        if (broad.length > 0)
          return { text: `Couldn't find exact matches for **"${query}"**, but here are the most affordable similar items:`, results: broad };
        return { text: notFoundMessage(query), results: [] };
      }
      const sorted = [...pool].sort((a, b) => a.price - b.price).slice(0, 4);
      return {
        text: `Here are the most affordable **${query || "products"}** we carry, starting from **${formatPrice(sorted[0].price)}**:`,
        results: sorted,
      };
    }

    case "expensive": {
      const pool2 = query ? quickSearch(query, products, 50) : products;
      if (pool2.length === 0) {
        const broad = broadSearch(query, products);
        if (broad.length > 0)
          return { text: `Couldn't find exact matches for **"${query}"**, but here are some premium similar items:`, results: broad };
        return { text: notFoundMessage(query), results: [] };
      }
      const sorted2 = [...pool2].sort((a, b) => b.price - a.price).slice(0, 4);
      return {
        text: `Here are the most premium **${query || "products"}** we carry, up to **${formatPrice(sorted2[0].price)}**:`,
        results: sorted2,
      };
    }

    case "price": {
      if (!query)
        return { text: "Which product do you want to check the price of? Just name it!", results: [] };
      const priceResults = quickSearch(query, products, 3);
      if (priceResults.length === 0)
        return { text: `I couldn't find pricing for **"${query}"**. Can you be more specific or try a different name?`, results: [] };
      if (priceResults.length === 1) {
        const p = priceResults[0];
        return { text: `**${p.name}** is priced at **${formatPrice(p.price)}** per ${p.unit}.`, results: [] };
      }
      return {
        text: `Here are the closest matches for **"${query}"** with their prices:`,
        results: priceResults,
      };
    }

    case "search":
    default: {
      if (!query)
        return { text: "What product are you looking for? Just name it — e.g. *\"honey\"*, *\"shampoo\"*, *\"wine\"*.", results: [] };

      // Primary search
      const results = quickSearch(query, products, 5);
      if (results.length > 0) {
        const total = results.length;
        return {
          text: total === 1
            ? `Here's a great match for **"${query}"**:`
            : `Here are **${total} options** for **"${query}"** you might like:`,
          results,
        };
      }

      // Broaden to individual words
      const broad = broadSearch(query, products);
      if (broad.length > 0) {
        return {
          text: `We don't have an exact match for **"${query}"**, but here are some related products you might like:`,
          results: broad,
        };
      }

      // Truly not in store
      return { text: notFoundMessage(query), results: [] };
    }
  }
}

// ─── Honest "not found" with helpful context ──────────────────────────────────
function notFoundMessage(query: string): string {
  return `Sorry, we don't carry **"${query}"** in our store right now.\n\nSimba Supermarket specialises in:\n🧴 Cosmetics & personal care\n🍷 Wines, beers & spirits\n🥗 Groceries & food\n🍳 Kitchenware & small appliances\n🧹 Cleaning products\n👶 Baby products\n\nTry searching within those areas — I'm happy to help!`;
}

// ─── Product mini-card in chat ────────────────────────────────────────────────
function ChatProductCard({ product, onNavigate }: { product: Product; onNavigate: () => void }) {
  const addItem = useStore((s) => s.addItem);
  const { toast } = useToast();
  const [failed, setFailed] = useState(false);
  const meta = CATEGORY_META[product.category];
  const imgSrc = product.image.includes("placehold.co") || !product.image
    ? getProductImage(product.id, product.name, product.category)
    : product.image;

  return (
    <div className="flex items-center gap-2.5 bg-white dark:bg-gray-700 rounded-xl p-2.5 border border-gray-100 dark:border-gray-600 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
      <Link href={`/products/${product.id}`} className="shrink-0" onClick={onNavigate}>
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600">
          {failed ? (
            <div className={`w-full h-full bg-gradient-to-br ${meta?.color || "from-gray-200 to-gray-300"} flex items-center justify-center`}>
              <span className="text-lg">{meta?.icon || "🛒"}</span>
            </div>
          ) : (
            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" onError={() => setFailed(true)} />
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/products/${product.id}`} onClick={onNavigate}>
          <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug hover:text-orange-600 transition-colors">
            {product.name}
          </p>
        </Link>
        <p className="text-orange-600 font-black text-xs mt-0.5">{formatPrice(product.price)}</p>
      </div>
      <button
        onClick={() => {
          if (!product.inStock) return;
          addItem(product);
          toast("Added to cart", "cart", product.name);
        }}
        disabled={!product.inStock}
        className={`shrink-0 p-1.5 rounded-lg transition-colors ${product.inStock ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed"}`}
      >
        <ShoppingCart className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Format message text — supports **bold** and *italic* ────────────────────
function MessageText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-line">
      {parts.map((part, i) => {
        if (part === "\n") return <br key={i} />;
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i} className="not-italic text-gray-500 dark:text-gray-400">{part.slice(1, -1)}</em>;
        return part;
      })}
    </p>
  );
}

// ─── Main Assistant Component ─────────────────────────────────────────────────
export default function SimbaAssistant() {
  const pathname = usePathname();
  const { t } = useLang();

  const items = useStore((s) => s.items);
  const totalItems = useStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const totalPrice = useStore((s) => s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      text: "Hi! 👋 I'm **SIMBA**, your shopping assistant. Ask me to find products, check prices, or browse categories. Try: *\"find me honey\"* or *\"cheapest wine\"*.",
      products: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceSupported] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
    return false;
  });
  const [thinking, setThinking] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [panelBottom, setPanelBottom] = useState(88);
  const [panelRight, setPanelRight] = useState(24);
  const [panelMaxH, setPanelMaxH] = useState("min(580px, calc(100dvh - 120px))");
  const [buttonBottom, setButtonBottom] = useState(24);
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const msgId = useRef(1);

  const modalRef = useFocusTrap(open, () => setOpen(false));

  // Load products and probe Claude availability
  useEffect(() => {
    getProducts().then((d) => {
      setAllProducts(d.products);
      fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "ping", catalog: "" }),
      }).then((r) => {
        setAiAvailable(r.status !== 503);
      }).catch(() => setAiAvailable(false));
    });
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Detect touch-only devices
  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  // Responsive positioning
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setButtonBottom(mobile ? 80 : 24);
      setPanelBottom(mobile ? 148 : 88);
      setPanelRight(mobile ? 16 : 24);
      setPanelMaxH(mobile ? "calc(100dvh - 220px)" : "min(580px, calc(100dvh - 120px))");
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // TTS
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, "").replace(/\n/g, ". ");
    const utter = new SpeechSynthesisUtterance(clean.slice(0, 200));
    utter.rate = 1.05;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  // Build a compressed catalog string
  const catalog = useMemo(() => {
    return allProducts
      .map((p) => `${p.id}|${p.name}|${p.category}|${p.price} RWF/${p.unit}`)
      .join("\n");
  }, [allProducts]);

  // Send message
  const send = useCallback(async (text: string, fromVoice = false) => {
    const trimmed = text.trim();
    if (!trimmed || allProducts.length === 0) return;

    const userMsg: Message = { id: msgId.current++, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    let responseText = "";
    let results: Product[] = [];
    let aiUsed = false;

    if (aiAvailable !== false && catalog) {
      try {
        const history = messages
          .filter((m) => m.id > 0)
          .slice(-6)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.text }));

        const resp = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, catalog, history }),
        });
        if (resp.ok) {
          const data = (await resp.json()) as { text: string; productIds: number[] };
          responseText = data.text;
          results = (data.productIds || [])
            .map((id) => allProducts.find((p) => p.id === id))
            .filter(Boolean) as Product[];
          aiUsed = true;
          if (aiAvailable === null) setAiAvailable(true);
        } else if (resp.status === 503) {
          setAiAvailable(false);
        }
      } catch {
        setAiAvailable(false);
      }
    }

    if (!aiUsed) {
      await new Promise((r) => setTimeout(r, 400));
      const { intent, query } = detectIntent(trimmed);
      const { text: t2, results: r2 } = buildResponse(intent, query, allProducts, totalItems, totalPrice);
      responseText = t2;
      results = r2;
    }

    const botMsg: Message = {
      id: msgId.current++,
      role: "assistant",
      text: responseText,
      products: results,
      groq: aiUsed,
    };
    setMessages((prev) => [...prev, botMsg]);
    setThinking(false);
    if (fromVoice) speak(responseText);
  }, [allProducts, totalItems, totalPrice, speak, aiAvailable, catalog, messages]);

  // Voice input
  const toggleVoice = useCallback(() => {
    if (!voiceSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      send(transcript, true);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [voiceSupported, listening, send]);

  // Early return if on dashboard/staff pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/staff")) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const quickPrompts = [
    "Got shampoo?",
    "Cheapest wine",
    "Baby products",
    "How much is Amarula?",
    "What categories do you have?",
  ];

  return (
    <>
      {/* ── Click-outside backdrop — desktop only (mobile is full-screen) ── */}
      {open && !isMobile && (
        <div
          className="fixed inset-0 z-[9997]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Chat Panel — full-screen on mobile, floating panel on desktop ── */}
      {open && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="SIMBA Shopping Assistant"
          className={
            isMobile
              ? "fixed inset-0 z-[9998] flex flex-col bg-white dark:bg-gray-900 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden"
              : "flex flex-col rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900"
          }
          style={isMobile ? {} : {
            position: "fixed",
            bottom: panelBottom,
            right: panelRight,
            width: "min(384px, calc(100vw - 32px))",
            height: panelMaxH,
            zIndex: 9998,
          }}
        >
          {/* Header */}
          <div className={`flex items-center gap-3 px-4 bg-orange-600 text-white shrink-0 ${isMobile ? "pt-12 pb-4" : "py-3"}`}>
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/30 shrink-0">
              <Image src="/images/simba-logo.jpeg" alt="Simba" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">SIMBA Assistant</p>
              <p className="text-orange-200 text-[10px]">
                {allProducts.length > 0
                  ? `${allProducts.length} products · ${aiAvailable ? "🤖 AI-powered" : "Smart search"}`
                  : "Loading..."}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {/* TTS toggle */}
              <button
                onClick={() => { setTtsEnabled(!ttsEnabled); window.speechSynthesis?.cancel(); }}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                title={ttsEnabled ? "Mute responses" : "Unmute responses"}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] ${msg.role === "user" ? "" : "w-full"}`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-orange-200 dark:ring-orange-800 shrink-0">
                        <Image src="/images/simba-logo.jpeg" alt="Simba" width={20} height={20} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">SIMBA</span>
                      {msg.groq && (
                        <span className="text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                          AI
                        </span>
                      )}
                    </div>
                  )}
                  <div className={`rounded-2xl px-3.5 py-2.5 ${
                    msg.role === "user"
                      ? "bg-orange-600 text-white rounded-tr-sm"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700"
                  }`}>
                    <MessageText text={msg.text} />
                  </div>
                  {/* Product results */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.products.map((p) => (
                        <ChatProductCard key={p.id} product={p} onNavigate={() => setOpen(false)} />
                      ))}
                      {msg.products.length >= 5 && (
                        <Link
                          href={`/products?category=${encodeURIComponent(msg.products[0]?.category || "")}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center gap-1 text-xs text-orange-600 font-bold py-1 hover:underline"
                        >
                          See all results <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts (shown when only greeting) */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shrink-0">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="shrink-0 text-[11px] font-medium border border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 rounded-full px-3 py-1.5 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            {/* Voice button */}
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  listening
                    ? "bg-orange-100 dark:bg-orange-950 text-orange-600 animate-pulse"
                    : "text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                }`}
                title={listening ? "Stop listening" : "Speak"}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Ask about products…"}
              className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
              disabled={listening}
            />

            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="shrink-0 w-9 h-9 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ── Hover tooltip ─────────────────────────────────────────────────────── */}
      {!isTouch && hovered && !open && (
        <div
          style={{ position: "fixed", bottom: buttonBottom + 4, right: 92, zIndex: 9998 }}
          className="pointer-events-none animate-in slide-in-from-right-3 fade-in duration-200"
        >
          <div className="bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 rounded-2xl rounded-br-none px-4 py-3 max-w-[210px]">
            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>👋</span> Hey there!
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 leading-relaxed">
              Ask me anything — I know all 789 products.
            </p>
          </div>
        </div>
      )}

      {/* ── Toggle Button — hidden on mobile while full-screen is open ── */}
      {(!isMobile || !open) && <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={open ? "Close SIMBA Assistant" : "Open SIMBA Assistant"}
        style={{ position: "fixed", bottom: buttonBottom, right: 24, zIndex: 9999 }}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 relative hover:ring-4 hover:ring-orange-400/30"
      >
        {!open && <div className="pulse-ring" />}
        {open ? (
          <>
            <div className="absolute inset-0 rounded-full bg-orange-600" />
            <X className="w-6 h-6 text-white relative z-10" />
          </>
        ) : (
          <div className="w-14 h-14 rounded-full overflow-hidden absolute inset-0">
            <Image src="/images/simba-logo.jpeg" alt="Simba Assistant" width={56} height={56} className="w-full h-full object-cover" />
          </div>
        )}
        {totalItems > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center z-10">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </button>}
    </>
  );
}
