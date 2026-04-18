/**
 * Maps product names to curated Unsplash photos by keyword matching.
 * Each keyword group has multiple images; selection is deterministic by productId.
 */

const KEYWORD_IMAGES: { keywords: string[]; images: string[] }[] = [
  // Air fresheners & perfumes
  {
    keywords: ["air wick", "air freshner", "perfum", "freshener", "alba gel"],
    images: [
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1562887189-10a0d37a0efa?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Shampoo & hair care
  {
    keywords: ["shampoo", "conditioner", "hair", "gel", "styling gel"],
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Body lotion, cream, moisturizer
  {
    keywords: ["lotion", "body milk", "cream", "moistur", "body active", "atopic"],
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Soap & handwash
  {
    keywords: ["soap", "handwash", "hand wash", "glycerin", "bar soap", "dalan", "covex", "apta glycer"],
    images: [
      "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600857062241-98e5dba7f51e?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1591854038359-1a5c7c7d43c9?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Shower gel & body wash
  {
    keywords: ["shower gel", "body wash", "bath"],
    images: [
      "https://images.unsplash.com/photo-1544722399-25b94e6f5b27?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Deodorant
  {
    keywords: ["deodor", "deo", "roll on", "antiperspirant"],
    images: [
      "https://images.unsplash.com/photo-1531422888678-e01f1a38d7ee?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600857062241-98e5dba7f51e?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Toothbrush, toothpaste, dental
  {
    keywords: ["toothbrush", "toothpaste", "mouthwash", "dental", "colgate", "oral"],
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607602132700-068258431cce?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Razor & shaving
  {
    keywords: ["razor", "shaving", "gillette", "gilette", "aftershave", "blade", "label after"],
    images: [
      "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Sunscreen & face care
  {
    keywords: ["sunscreen", "face wash", "face cream", "spf", "toner", "serum"],
    images: [
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Wine
  {
    keywords: ["wine", "sauvignon", "merlot", "chardonnay", "blanc", "rouge", "rosé", "sparkling wine", "champagne", "cinzano", "carmela", "chamdor", "alsace", "amani bay", "7hills"],
    images: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Beer & malt
  {
    keywords: ["beer", "lager", "malt", "guinness", "amstel", "corona", "stella"],
    images: [
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Whisky & spirits
  {
    keywords: ["whisky", "whiskey", "scotch", "bourbon", "jack daniel", "black label", "bond 7", "belle france whisky"],
    images: [
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Gin & vodka
  {
    keywords: ["gin", "vodka", "beefeater", "bulldog", "amarula gin"],
    images: [
      "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Cognac & brandy
  {
    keywords: ["cognac", "brandy", "abk6"],
    images: [
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Liqueur
  {
    keywords: ["amarula", "liqueur", "liquor", "baileys"],
    images: [
      "https://images.unsplash.com/photo-1510706019499-7f903c9bcc09?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Honey
  {
    keywords: ["honey"],
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Canned meat & luncheon
  {
    keywords: ["luncheon", "corned beef", "sausage", "meat", "chicken"],
    images: [
      "https://images.unsplash.com/photo-1607623814075-e51df68bef71?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Syrup, jam, condiments
  {
    keywords: ["syrup", "jam", "chocolate syrup", "pancake", "sauce"],
    images: [
      "https://images.unsplash.com/photo-1511381939415-e44cd18b5d6e?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Iron (clothes)
  {
    keywords: ["iron", "steam iron", "dry iron"],
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Coffee pot & kettle
  {
    keywords: ["coffee pot", "mocha", "coffee maker", "kettle", "electric kettle"],
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1416568560-a8e50d73ebf9?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Storage containers
  {
    keywords: ["canister", "storage", "container", "jar", "bottle", "bottel"],
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Frying pan & cookware
  {
    keywords: ["frying pan", "pan", "pot", "cookware", "schafer", "domedia"],
    images: [
      "https://images.unsplash.com/photo-1585325701165-35735060a37d?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Cutlery (knife, spoon, fork)
  {
    keywords: ["knife", "spoon", "fork", "cutlery", "shovel", "scoop"],
    images: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe1?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Cups & glasses
  {
    keywords: ["cup", "glass", "mug", "cristal", "longchamp", "cappuccino cup"],
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Electrical & extension
  {
    keywords: ["extension", "socket", "plug", "adapter", "geepas", "electric"],
    images: [
      "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Paper & stationery
  {
    keywords: ["paper", "a4", "photocopying", "sinar", "smart copy", "jambo", "scotch"],
    images: [
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Baby milk & formula
  {
    keywords: ["baby", "milk", "lactogen", "formula", "infant", "nestle"],
    images: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Massage & fitness
  {
    keywords: ["massage", "roller", "fitness", "sport", "gym"],
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Cleaning brushes, mops, toilet brush
  {
    keywords: ["brush", "mop", "toilet brush", "broom", "scrub", "yirong"],
    images: [
      "https://images.unsplash.com/photo-1585349765498-a9c73c6f4a79?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Toilet cleaner & bleach
  {
    keywords: ["toilet cleaner", "bleach", "jik", "harpic", "ace toilet", "boom toilet", "boom force", "brix floor"],
    images: [
      "https://images.unsplash.com/photo-1585349765498-a9c73c6f4a79?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Dishwashing & detergent
  {
    keywords: ["dishwash", "detergent", "washing powder", "scouring", "axion", "alba scour", "kabisa", "cussons morning", "belle france citron", "bhi car shampoo"],
    images: [
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Fabric softener & laundry
  {
    keywords: ["fabric softner", "fabric softener", "sosoft", "apta fabric", "alba fabric"],
    images: [
      "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Toilet paper & tissues
  {
    keywords: ["toilet paper", "tissue", "kitchen towel", "paper towel", "ayin", "douceur"],
    images: [
      "https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598897516650-7e8cc8e1e573?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Cleaning cloths
  {
    keywords: ["cloth", "microfiber", "floor-cloth", "tower", "towel"],
    images: [
      "https://images.unsplash.com/photo-1563207153-f403bf289096?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Heater
  {
    keywords: ["heater", "radiant"],
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Straws & aluminium foil
  {
    keywords: ["straw", "aluminium foil", "foil", "boni selection straw"],
    images: [
      "https://images.unsplash.com/photo-1603792907191-89e55f70099a?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Electric pan & appliances
  {
    keywords: ["electric pan", "sutai", "frying pan electric"],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Dog care
  {
    keywords: ["dog", "river dog", "pet"],
    images: [
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=300&h=300&fit=crop&q=80",
    ],
  },
  // Coconut oil
  {
    keywords: ["coconut oil", "kentaste"],
    images: [
      "https://images.unsplash.com/photo-1526735220921-ef73b9e1f65f?w=300&h=300&fit=crop&q=80",
    ],
  },
];

// Fallback images per category
const CATEGORY_FALLBACKS: Record<string, string[]> = {
  "Cosmetics & Personal Care": [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop&q=80",
  ],
  "Alcoholic Drinks": [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop&q=80",
  ],
  "Food Products": [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=300&h=300&fit=crop&q=80",
  ],
  "Kitchenware & Electronics": [
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&q=80",
  ],
  "General": [
    "https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=300&fit=crop&q=80",
  ],
  "Cleaning & Sanitary": [
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585349765498-a9c73c6f4a79?w=300&h=300&fit=crop&q=80",
  ],
  "Sports & Fitness": [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop&q=80",
  ],
  "Stationery": [
    "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&h=300&fit=crop&q=80",
  ],
  "Baby Products": [
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&h=300&fit=crop&q=80",
  ],
};

export function getProductImage(id: number, name: string, category: string): string {
  const lname = name.toLowerCase();
  for (const group of KEYWORD_IMAGES) {
    if (group.keywords.some((kw) => lname.includes(kw))) {
      return group.images[id % group.images.length];
    }
  }
  const fallbacks = CATEGORY_FALLBACKS[category];
  if (fallbacks) return fallbacks[id % fallbacks.length];
  return `https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&h=300&fit=crop&q=80`;
}
