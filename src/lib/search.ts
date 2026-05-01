import { Product } from "./products";

// Synonym groups — searching any term expands to all related terms
const SYNONYM_GROUPS: string[][] = [
  ["soap", "handwash", "hand wash", "glycerin", "bar soap", "savon"],
  ["shampoo", "hair wash", "conditioner", "hair care"],
  ["lotion", "body milk", "cream", "moisturizer", "moisturising", "skin care"],
  ["deodorant", "deo", "roll on", "antiperspirant", "body spray"],
  ["shower gel", "body wash", "bath gel"],
  ["toothbrush", "toothpaste", "mouthwash", "dental", "oral care", "teeth"],
  ["razor", "shaving", "aftershave", "blade", "shave"],
  ["wine", "sauvignon", "merlot", "blanc", "rouge", "sparkling wine", "champagne", "vin"],
  ["beer", "lager", "malt", "biere", "brewed"],
  ["whisky", "whiskey", "scotch", "bourbon"],
  ["gin", "vodka", "spirit"],
  ["liqueur", "cognac", "brandy", "amarula"],
  ["bleach", "jik", "disinfectant", "whitener"],
  ["toilet cleaner", "harpic", "ace cleaner", "boom cleaner"],
  ["dishwash", "dish washing", "axion", "scouring", "detergent"],
  ["fabric softener", "softner", "laundry", "sosoft"],
  ["floor cleaner", "brix", "floor care"],
  ["toilet paper", "tissue", "paper towel", "kitchen towel", "serviette"],
  ["mop", "cleaning brush", "broom", "toilet brush"],
  ["honey", "miel"],
  ["canned", "luncheon", "corned beef", "sausage", "preserved meat"],
  ["iron", "steam iron", "pressing"],
  ["kettle", "electric kettle", "water heater"],
  ["coffee pot", "mocha", "cafetière"],
  ["frying pan", "pan", "cookware", "pot"],
  ["knife", "cutlery", "spoon", "fork", "shovel"],
  ["cup", "glass", "mug", "gobelet"],
  ["extension", "power strip", "socket", "plug", "adapter"],
  ["paper", "a4", "printing paper", "copy paper", "stationery"],
  ["baby", "infant", "formula", "lactogen", "baby milk"],
  ["perfume", "fragrance", "air freshener", "scent", "parfum"],
  ["coconut oil", "hair oil", "kentaste"],
  ["hair gel", "styling gel", "hair style"],
];

function buildSynonymMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const group of SYNONYM_GROUPS) {
    for (const term of group) {
      map.set(term, group.filter((t) => t !== term));
    }
  }
  return map;
}

const SYNONYM_MAP = buildSynonymMap();

/**
 * Strip conversational filler to get the core product query.
 * Useful for both the Assistant and the Search Bar.
 */
export function extractQuery(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\b(got|do you have|do you carry|do you sell|do you stock|have you got|have you|is there|are there|can i get|can i buy|can i find|can you find|can you show|find me|show me|looking for|i need|i want|i am looking for|i'm looking for|searching for|search for|get me|do you)\b/g, "")
    .replace(/\b(in your store|in the store|in stock|available|please|right now|today|for me|any chance|any)\b/g, "")
    .replace(/[?!.]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshtein(a: string, b: string): number {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function expandTerms(query: string): string[] {
  const q = query.toLowerCase();
  const extra: string[] = [];
  SYNONYM_MAP.forEach((synonyms, term) => {
    if (q.includes(term)) extra.push(...synonyms);
  });
  return [...new Set([q, ...extra])];
}

function scoreProduct(product: Product, terms: string[]): number {
  const name = product.name.toLowerCase();
  const cat = product.category.toLowerCase();
  const primaryTerm = terms[0];
  let score = 0;

  // Exact full name match — very high
  if (name === primaryTerm) return 1000;

  // Primary term exact substring in name
  if (name.includes(primaryTerm)) score += 100;
  else if (cat.includes(primaryTerm)) score += 50;

  // Word-level matching: each query word that appears in the name
  const queryWords = primaryTerm.split(/\s+/).filter((w) => w.length > 2);
  for (const word of queryWords) {
    if (name.includes(word)) score += 20;
    if (cat.includes(word)) score += 8;

    // Fuzzy word match (handles 1 typo in words longer than 4 chars)
    if (word.length > 4) {
      const nameWords = name.split(/\s+/);
      for (const nw of nameWords) {
        if (nw.length > 4 && levenshtein(word, nw) <= 1) {
          score += 15;
          break;
        }
      }
    }
  }

  // Synonym/expanded terms in name
  for (let i = 1; i < terms.length; i++) {
    if (name.includes(terms[i])) score += 30;
    else if (cat.includes(terms[i])) score += 15;
  }

  // Starts-with bonus
  if (name.startsWith(primaryTerm)) score += 25;

  // Partial fuzzy: count consecutive bigrams shared
  if (primaryTerm.length >= 4) {
    let bigrams = 0;
    for (let i = 0; i < primaryTerm.length - 1; i++) {
      if (name.includes(primaryTerm.slice(i, i + 2))) bigrams++;
    }
    score += bigrams * 2;
  }

  return score;
}

export interface SearchResult {
  product: Product;
  score: number;
}

export function smartSearch(query: string, products: Product[]): Product[] {
  const cleanQ = extractQuery(query);
  if (!cleanQ) return products;

  const terms = expandTerms(cleanQ);

  const results: SearchResult[] = products
    .map((p) => ({ product: p, score: scoreProduct(p, terms) }))
    .filter((r) => r.score >= 20)   // require at least one real match
    .sort((a, b) => b.score - a.score);

  return results.map((r) => r.product);
}

// Lightweight version for the assistant (returns top N)
export function quickSearch(query: string, products: Product[], limit = 5): Product[] {
  return smartSearch(query, products).slice(0, limit);
}

