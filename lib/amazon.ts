export const AMAZON_TAG_US = 'minoxidilusa-20';
export const AMAZON_TAG_ES = 'minoxidilusa-21';

export type AmazonStoreRegion = 'US' | 'ES';

export interface AmazonProductRecommendation {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  features: string[];
  rating: string;
  reviewsCount: string;
  categoryType:
    | 'microneedling'
    | 'shampoo'
    | 'beard'
    | 'supplement'
    | 'applicator'
    | 'skincare'
    | 'foam';
  /** Optional direct ASIN on Amazon.com */
  asinUS?: string;
  /** Optional direct ASIN on Amazon.es */
  asinES?: string;
  /** Targeted high-converting Amazon.com search query */
  queryUS: string;
  /** Targeted high-converting Amazon.es search query */
  queryES: string;
  ctaLabel: string;
}

export interface AmazonPageContext {
  sectionTitle: string;
  sectionSubtitle: string;
  products: [
    AmazonProductRecommendation,
    AmazonProductRecommendation,
    AmazonProductRecommendation,
  ];
}

/**
 * Builds an official Amazon Associates affiliate link:
 * - US / Global (default): amazon.com with tag=minoxidilusa-20
 * - Spain / Europe: amazon.es with tag=minoxidilusa-21
 */
export function buildAmazonUrl(
  product: AmazonProductRecommendation,
  region: AmazonStoreRegion
): string {
  if (region === 'ES') {
    if (product.asinES) {
      return `https://www.amazon.es/dp/${product.asinES}?tag=${AMAZON_TAG_ES}`;
    }
    const q = encodeURIComponent(product.queryES);
    return `https://www.amazon.es/s?k=${q}&tag=${AMAZON_TAG_ES}`;
  }

  if (product.asinUS) {
    return `https://www.amazon.com/dp/${product.asinUS}?tag=${AMAZON_TAG_US}`;
  }
  const q = encodeURIComponent(product.queryUS);
  return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG_US}`;
}

/**
 * Automatically detects whether the visitor is in the US/Americas (default)
 * or Spain/Europe based on browser timezone & locale.
 */
export function detectUserAmazonRegion(): AmazonStoreRegion {
  if (typeof window === 'undefined') {
    return 'US'; // Default SSR region for minoxidil-usa.com
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.language || '').toLowerCase();

    if (
      tz === 'Europe/Madrid' ||
      tz === 'Atlantic/Canary' ||
      tz === 'Europe/Ceuta' ||
      lang === 'es-es' ||
      tz.startsWith('Europe/')
    ) {
      return 'ES';
    }

    return 'US';
  } catch {
    return 'US';
  }
}

// ============================================================================
// CURATED MEN'S GROOMING, HAIR & BEARD CARE CATALOG (AMAZON.COM & AMAZON.ES)
// ============================================================================

export const CATALOG = {
  DERMA_STAMP_ADJUSTABLE: {
    id: 'derma-stamp-adjustable',
    badge: '🏆 #1 Best Companion for Minoxidil',
    title: 'Adjustable Titanium Microneedle Derma Stamp (0.25mm – 1.5mm) for Men',
    subtitle:
      'Precision vertical microneedling stamp designed for receding hairlines, crown thinning, and patchy beards without pulling or tangling existing hair.',
    features: [
      '140 surgical-grade titanium pins with dial adjustable depth from 0.25mm to 1.5mm',
      'Boosts follicular blood flow and activates SULT1A1 enzymes for up to 3x better regrowth',
      'Vertical stamping action prevents micro-tears on the scalp and jawline',
    ],
    rating: '4.7',
    reviewsCount: '6,800+',
    categoryType: 'microneedling',
    queryUS: 'adjustable titanium microneedle derma stamp hair beard growth men',
    queryES: 'derma stamp ajustable titanio capilar barba hombre',
    ctaLabel: "Check Today's Price on Amazon",
  } satisfies AmazonProductRecommendation,

  DERMA_ROLLER_05MM: {
    id: 'derma-roller-05mm',
    badge: '🧔 #1 Best Seller for Beard Growth',
    title: '0.5mm Titanium Microneedle Derma Roller Kit for Men’s Beard & Scalp',
    subtitle:
      'The classic 540-titanium-needle grooming roller engineered to awaken dormant facial hair follicles on patchy cheeks and stimulate collagen.',
    features: [
      '0.5mm clinical needle length ideal for weekly beard and hairline stimulation',
      'Ergonomic non-slip masculine grip with protective travel & sanitizing storage case',
      'Pairs seamlessly with cream-based or topical 5% Minoxidil routines (wait 24h after rolling)',
    ],
    rating: '4.6',
    reviewsCount: '14,200+',
    categoryType: 'microneedling',
    queryUS: '0.5mm titanium derma roller beard hair growth men kit',
    queryES: 'derma roller 0.5mm titanio barba pelo hombre',
    ctaLabel: 'View Beard Roller on Amazon',
  } satisfies AmazonProductRecommendation,

  NIZORAL_KETOCONAZOLE: {
    id: 'nizoral-ketoconazole-shampoo',
    badge: '🛡️ #1 Dermatologist-Recommended Shampoo',
    title: 'Nizoral Anti-Dandruff & Scalp Care Shampoo with 1% Ketoconazole',
    subtitle:
      'Essential clinical scalp wash for men using Minoxidil: clears propylene-glycol flaking, calms itching, and helps disrupt localized follicular DHT.',
    features: [
      'Contains 1% Ketoconazole clinically proven to control scalp flaking, scaling, and itching',
      'Used 2–3 times weekly alongside Minoxidil as part of the "Big 3" hair restoration protocol',
      'Deeply cleanses sebum and residue so topical treatments absorb cleanly into follicles',
    ],
    rating: '4.7',
    reviewsCount: '92,400+',
    categoryType: 'shampoo',
    asinUS: 'B00AINMFAC',
    queryUS: 'Nizoral Anti-Dandruff Shampoo 1% Ketoconazole',
    queryES: 'champu ketoconazol anticaspa cuero cabelludo hombre',
    ctaLabel: 'Check Price on Amazon',
  } satisfies AmazonProductRecommendation,

  BIOTIN_DHT_SHAMPOO: {
    id: 'biotin-dht-blocker-shampoo',
    badge: '💧 Best Daily Men’s Thickening Wash',
    title: 'Men’s Biotin & Saw Palmetto DHT-Blocker Thickening Shampoo & Conditioner',
    subtitle:
      'Sulfate-free daily strengthening wash formulated with Biotin, Saw Palmetto, Rosemary, and Caffeine to thicken thinning hair shafts.',
    features: [
      'Botanical DHT-blocking complex (Saw Palmetto, Pumpkin Seed & Rosemary Extract)',
      '100% Sulfate-free & Paraben-free: gentle enough for daily washing before Minoxidil',
      'Adds immediate volume and structural fullness to fine or miniaturized hair',
    ],
    rating: '4.6',
    reviewsCount: '19,500+',
    categoryType: 'shampoo',
    queryUS: 'mens biotin saw palmetto dht blocker thickening shampoo sulfate free',
    queryES: 'champu biotina saw palmetto anticaida hombre sin sulfatos',
    ctaLabel: 'View Men’s Shampoo on Amazon',
  } satisfies AmazonProductRecommendation,

  SCALP_MASSAGER_BRUSH: {
    id: 'silicone-scalp-massager',
    badge: '⚡ Micro-Circulation Booster',
    title: 'Men’s Silicone Scalp Massager & Exfoliating Shower Shampoo Brush',
    subtitle:
      'Ergonomic soft-silicone scalp scrubber that exfoliates dead skin buildup, relieves tension, and boosts blood flow to hair roots.',
    features: [
      'Medical-grade flexible silicone bristles exfoliate dry flakes without scratching the scalp',
      'Daily 4-minute mechanical massage clinically shown to increase dermal papilla thickness',
      'Waterproof one-piece design ideal for shower lathering or dry scalp stimulation',
    ],
    rating: '4.8',
    reviewsCount: '48,000+',
    categoryType: 'shampoo',
    queryUS: 'mens silicone scalp massager shampoo brush hair growth',
    queryES: 'masajeador cuero cabelludo silicona cepillo champu hombre',
    ctaLabel: 'Check Price on Amazon',
  } satisfies AmazonProductRecommendation,

  PHILIPS_BEARD_TRIMMER: {
    id: 'philips-norelco-beard-trimmer',
    badge: '💈 #1 Men’s Precision Beard Trimmer',
    title: 'Philips Norelco MultiGroom & Precision Stubble Beard Trimmer Kit',
    subtitle:
      'Keep faster-growing terminal hairs and new vellus beard hairs at an even, sharp barbershop length without pulling follicles.',
    features: [
      'Self-sharpening DualCut steel blades with precision guards (0.5mm to 16mm)',
      'Allows topical Minoxidil to reach the skin beneath your beard instead of getting trapped in long hair',
      'Lithium-ion rechargeable battery with waterproof rinseable attachments',
    ],
    rating: '4.7',
    reviewsCount: '84,000+',
    categoryType: 'beard',
    queryUS: 'Philips Norelco Multigroom beard trimmer men kit',
    queryES: 'Philips recortadora barba precision hombre',
    ctaLabel: 'View Trimmer Deal on Amazon',
  } satisfies AmazonProductRecommendation,

  BOAR_BRISTLE_BEARD_KIT: {
    id: 'boar-bristle-beard-brush-kit',
    badge: '🧔 Essential Beard Training Kit',
    title: '100% Natural Boar Bristle Beard Brush & Pearwood Pocket Comb Set for Men',
    subtitle:
      'Train new Minoxidil beard hairs to grow downward, exfoliate dry skin beneath your beard, and distribute natural sebum evenly.',
    features: [
      'Firm 100% natural boar bristles exfoliate cheek skin and tame wire-like new beard hairs',
      'Anti-static dual-tooth wooden pocket comb prevents snagging or pulling fragile vellus hairs',
      'Improves blood circulation along the jawline and mustache connector zones',
    ],
    rating: '4.7',
    reviewsCount: '21,300+',
    categoryType: 'beard',
    queryUS: '100% boar bristle beard brush and wooden comb set men',
    queryES: 'cepillo barba cerdas jabali peine madera hombre',
    ctaLabel: 'Check Beard Kit on Amazon',
  } satisfies AmazonProductRecommendation,

  CASTOR_ROSEMARY_OIL: {
    id: 'castor-rosemary-growth-oil',
    badge: '🌿 Best Post-Minoxidil Conditioning Oil',
    title: 'Organic Cold-Pressed Rosemary Mint & Jamaican Black Castor Oil for Hair & Beard',
    subtitle:
      'Nutrient-rich botanical oil blend to apply 30–45 minutes after Minoxidil dries, locking in moisture and nourishing hair shafts.',
    features: [
      '100% pure cold-pressed Jamaican Black Castor Oil infused with Rosemary & Peppermint',
      'Rich in ricinoleic acid and omega-6/9 fatty acids to prevent beard and hair breakage',
      'Includes precision glass dropper for targeted scalp, temple, and beard hydration',
    ],
    rating: '4.6',
    reviewsCount: '34,700+',
    categoryType: 'beard',
    queryUS: 'rosemary mint jamaican black castor oil hair beard growth men',
    queryES: 'aceite romero y ricino negro crecimiento cabello barba hombre',
    ctaLabel: 'Check Price on Amazon',
  } satisfies AmazonProductRecommendation,

  MENS_BIOTIN_SAW_PALMETTO: {
    id: 'mens-biotin-saw-palmetto-vitamins',
    badge: '💊 #1 Internal Follicle Support',
    title: 'Men’s Hair & Beard Growth Vitamins — Biotin 10,000 mcg, Saw Palmetto & Zinc',
    subtitle:
      'Support your topical Minoxidil routine from the inside out with clinical-dose keratin builders and natural DHT-blocking nutrients.',
    features: [
      'High-potency Biotin (10,000 mcg), Zinc, Vitamin D3, and Folate for stronger keratin synthesis',
      'Standardized Saw Palmetto berry extract + Horsetail silica to support thick hair density',
      'Made in the USA in GMP-certified facilities for daily men’s hair and beard wellness',
    ],
    rating: '4.6',
    reviewsCount: '15,900+',
    categoryType: 'supplement',
    queryUS: 'mens hair beard growth vitamins biotin 10000 mcg saw palmetto zinc',
    queryES: 'vitaminas biotina 10000 mcg saw palmetto zinc pelo barba hombre',
    ctaLabel: 'View Supplement on Amazon',
  } satisfies AmazonProductRecommendation,

  CERAMIDE_FACIAL_MOISTURIZER: {
    id: 'mens-ceramide-facial-moisturizer',
    badge: '🧴 Best Barrier Repair Moisturizer',
    title: 'Men’s Daily Ceramide & Hyaluronic Acid Facial Moisturizer (Oil-Free, Non-Comedogenic)',
    subtitle:
      'Restore skin hydration 30 minutes after applying Minoxidil without clogging pores or blocking follicular absorption.',
    features: [
      '3 essential ceramides + hyaluronic acid repair dry, tight skin caused by topical solutions',
      'Lightweight, non-greasy matte finish engineered for men’s facial skin and jawline',
      'Fragrance-free & non-comedogenic: zero DHT-blocking harshness for beard growers',
    ],
    rating: '4.8',
    reviewsCount: '67,500+',
    categoryType: 'skincare',
    queryUS: 'mens ceramide hyaluronic acid facial moisturizer oil free non comedogenic',
    queryES: 'crema hidratante facial ceramidas acido hialuronico hombre',
    ctaLabel: 'Check Price on Amazon',
  } satisfies AmazonProductRecommendation,

  ROOT_SCALP_APPLICATOR: {
    id: 'precision-root-scalp-applicator',
    badge: '🎯 Zero-Waste 1 mL Root Applicator',
    title: 'Precision Scalp Liquid Applicator Comb & Graduated 1 mL Dropper Bottle for Men',
    subtitle:
      'Deliver topical hair solutions directly onto the scalp skin instead of wasting medication on your hair strands or fingers.',
    features: [
      'Rolling ball-tooth dispensing pins release liquid only when pressed against the scalp',
      'Clear graduated mL measurement scale ensures an exact 1 mL clinical dose every time',
      'Prevents messy forehead dripping and keeps hands clean during morning and night applications',
    ],
    rating: '4.6',
    reviewsCount: '5,400+',
    categoryType: 'applicator',
    queryUS: 'scalp applicator comb graduated 1ml minoxidil hair oil applicator men',
    queryES: 'aplicador cuero cabelludo peine dosificador 1ml locion capilar',
    ctaLabel: 'View Applicator on Amazon',
  } satisfies AmazonProductRecommendation,

  SATIN_PILLOWCASE_SET: {
    id: 'mens-satin-pillowcase-set',
    badge: '🌙 Nighttime Hair & Beard Protection',
    title: 'Men’s Breathable Cooling Satin Pillowcases (2-Pack, Charcoal / Navy)',
    subtitle:
      'Reduce overnight hair friction, prevent new vellus breakage during the shedding phase, and keep your nighttime routine clean.',
    features: [
      'Ultra-smooth low-friction weave prevents tangling and mechanical pulling on thinning hair',
      'Does not strip natural moisture from your scalp or beard like rough cotton pillowcases',
      'Machine-washable envelope closure in masculine charcoal gray and navy blue',
    ],
    rating: '4.7',
    reviewsCount: '41,000+',
    categoryType: 'applicator',
    queryUS: 'mens cooling satin pillowcase 2 pack dark gray hair protection',
    queryES: 'funda almohada saten gris oscuro pack 2 cuidado cabello barba',
    ctaLabel: 'Check Price on Amazon',
  } satisfies AmazonProductRecommendation,

  MENS_5PCT_FOAM_KIT: {
    id: 'mens-5pct-topical-foam-kit',
    badge: '⭐ Top-Rated on Amazon USA',
    title: 'Men’s 5% Minoxidil Unscented Topical Aerosol Foam (3-Month & 6-Month Supply)',
    subtitle:
      'Fast-drying propylene-glycol-free 5% topical foam option on Amazon for men comparing foam, liquid, and cream regrowth formats.',
    features: [
      'FDA-approved 5% Minoxidil active concentration for male pattern vertex & crown regrowth',
      'Aerosol foam format dries in under 15 minutes with minimal greasy residue',
      'Available in multi-month value packs with Prime delivery',
    ],
    rating: '4.6',
    reviewsCount: '38,900+',
    categoryType: 'foam',
    queryUS: 'mens 5% minoxidil unscented foam hair regrowth 3 month supply',
    queryES: 'minoxidil 5% espuma capilar hombre tratamiento',
    ctaLabel: 'Compare Prices on Amazon',
  } satisfies AmazonProductRecommendation,
};

// ============================================================================
// CONTEXTUAL MATCHING ENGINE FOR ALL 1,267 ARTICLES & 9 CATEGORIES
// ============================================================================

export function getAmazonContextForArticle(post: {
  slug: string;
  title: string;
  category: string;
}): AmazonPageContext {
  const text = `${post.slug} ${post.title}`.toLowerCase();

  // 1. Beard Growth, Patchy Cheeks, Facial Hair & Barber Trimming
  if (
    post.category === 'beard' ||
    text.includes('beard') ||
    text.includes('facial-hair') ||
    text.includes('mustache') ||
    text.includes('patchy')
  ) {
    return {
      sectionTitle: '🧔 Essential Men’s Beard Growth & Grooming Gear on Amazon',
      sectionSubtitle:
        'Maximize your facial hair transformation by pairing your daily Minoxidil routine with clinical microneedling, precision trimming, and boar-bristle training.',
      products: [
        CATALOG.DERMA_ROLLER_05MM,
        CATALOG.PHILIPS_BEARD_TRIMMER,
        CATALOG.BOAR_BRISTLE_BEARD_KIT,
      ],
    };
  }

  // 2. Shampoo, Showering, Washing Hair & Combining Hair Products
  if (
    text.includes('shampoo') ||
    text.includes('shower') ||
    text.includes('wash') ||
    text.includes('other-hair-products') ||
    text.includes('conditioner')
  ) {
    return {
      sectionTitle: '🚿 Best Men’s DHT-Blocking Shampoos & Scalp Care on Amazon',
      sectionSubtitle:
        'Use a dermatologist-trusted Ketoconazole or sulfate-free Biotin shampoo before applying Minoxidil to keep follicles clean, flake-free, and receptive.',
      products: [
        CATALOG.NIZORAL_KETOCONAZOLE,
        CATALOG.BIOTIN_DHT_SHAMPOO,
        CATALOG.SCALP_MASSAGER_BRUSH,
      ],
    };
  }

  // 3. Microneedling, Derma Roller, Receding Hairline, Temples & Crown
  if (
    text.includes('derma-roller') ||
    text.includes('microneedl') ||
    text.includes('hairline') ||
    text.includes('temple') ||
    text.includes('crown') ||
    text.includes('vertex')
  ) {
    return {
      sectionTitle: '⚡ Best-Selling Men’s Microneedling & Hairline Tools on Amazon',
      sectionSubtitle:
        'Clinical studies show combining weekly 0.5mm–1.0mm titanium microneedling with 5% Minoxidil stimulates up to 3x more follicular regrowth.',
      products: [
        CATALOG.DERMA_STAMP_ADJUSTABLE,
        CATALOG.DERMA_ROLLER_05MM,
        CATALOG.MENS_BIOTIN_SAW_PALMETTO,
      ],
    };
  }

  // 4. Castor Oil, Rosemary Oil, Growth Serums & Natural Alternatives
  if (
    text.includes('castor-oil') ||
    text.includes('rosemary') ||
    text.includes('serum') ||
    text.includes('natural-alternative') ||
    text.includes('essential-oil') ||
    text.includes('scalp-massage')
  ) {
    return {
      sectionTitle: '🌿 Top Men’s Botanical Growth Oils & Follicle Boosters on Amazon',
      sectionSubtitle:
        'Layer cold-pressed Rosemary & Jamaican Black Castor Oil 30–45 minutes after Minoxidil or support your follicles internally with Biotin & Saw Palmetto.',
      products: [
        CATALOG.CASTOR_ROSEMARY_OIL,
        CATALOG.SCALP_MASSAGER_BRUSH,
        CATALOG.MENS_BIOTIN_SAW_PALMETTO,
      ],
    };
  }

  // 5. Side Effects, Scalp Itching, Flaking, Redness, Shedding & Skin Care
  if (
    post.category === 'side-effects' ||
    text.includes('itch') ||
    text.includes('flak') ||
    text.includes('dry') ||
    text.includes('redness') ||
    text.includes('irritation') ||
    text.includes('shedding') ||
    text.includes('headache') ||
    text.includes('heart-rate')
  ) {
    return {
      sectionTitle: '🛡️ Men’s Scalp Soothing, Barrier Repair & Precision Dosing Essentials',
      sectionSubtitle:
        'Eliminate flaking, prevent over-application, and protect your skin barrier while your follicles transition through the growth cycle.',
      products: [
        CATALOG.NIZORAL_KETOCONAZOLE,
        CATALOG.CERAMIDE_FACIAL_MOISTURIZER,
        CATALOG.ROOT_SCALP_APPLICATOR,
      ],
    };
  }

  // 6. Storage, Expiration, Sleep, Pillow Transfer & Daily Application Routine
  if (
    text.includes('store') ||
    text.includes('expiration') ||
    text.includes('expire') ||
    text.includes('sleep') ||
    text.includes('pillow') ||
    text.includes('dosage') ||
    text.includes('how-often') ||
    text.includes('how-to-apply') ||
    post.category === 'usage' ||
    post.category === 'faq'
  ) {
    return {
      sectionTitle: '🎯 Men’s Precision Application & Daily Routine Upgrades on Amazon',
      sectionSubtitle:
        'Apply an exact 1 mL dose directly to the roots without mess, stimulate absorption with an adjustable Derma Stamp, and protect your hair overnight.',
      products: [
        CATALOG.ROOT_SCALP_APPLICATOR,
        CATALOG.DERMA_STAMP_ADJUSTABLE,
        CATALOG.SATIN_PILLOWCASE_SET,
      ],
    };
  }

  // 7. Brand Comparisons & Reviews (Kirkland, Rogaine, Foam vs Liquid, Finasteride)
  if (
    post.category === 'comparison' ||
    post.category === 'reviews' ||
    text.includes('kirkland') ||
    text.includes('rogaine') ||
    text.includes('brand') ||
    text.includes('foam') ||
    text.includes('finasteride')
  ) {
    return {
      sectionTitle: '⚖️ Top-Rated Men’s Hair Regrowth & DHT-Blocker Essentials on Amazon',
      sectionSubtitle:
        'Compare the highest-rated topical kits, clinical Ketoconazole washes, and internal DHT-support supplements trusted by thousands of men in the USA.',
      products: [
        CATALOG.MENS_5PCT_FOAM_KIT,
        CATALOG.DERMA_STAMP_ADJUSTABLE,
        CATALOG.NIZORAL_KETOCONAZOLE,
      ],
    };
  }

  // 8. Default Men's Hair & Scalp Regrowth Kit (hair, science, women, general)
  return {
    sectionTitle: '🏆 Best-Selling Men’s Hair & Scalp Regrowth Essentials on Amazon',
    sectionSubtitle:
      'Complete your daily hair restoration stack with dermatologist-recommended microneedling, 1% Ketoconazole scalp care, and Biotin + Saw Palmetto.',
    products: [
      CATALOG.DERMA_STAMP_ADJUSTABLE,
      CATALOG.NIZORAL_KETOCONAZOLE,
      CATALOG.MENS_BIOTIN_SAW_PALMETTO,
    ],
  };
}

export function getAmazonContextForCategory(categorySlug: string): AmazonPageContext {
  switch (categorySlug) {
    case 'beard':
      return {
        sectionTitle: '🧔 Top-Rated Men’s Beard Growth & Trimming Gear on Amazon',
        sectionSubtitle:
          'Everything you need to turn patchy vellus facial hair into a thick, well-groomed terminal beard.',
        products: [
          CATALOG.DERMA_ROLLER_05MM,
          CATALOG.PHILIPS_BEARD_TRIMMER,
          CATALOG.BOAR_BRISTLE_BEARD_KIT,
        ],
      };
    case 'side-effects':
      return {
        sectionTitle: '🛡️ Dermatologist-Recommended Scalp Care & Barrier Protection on Amazon',
        sectionSubtitle:
          'Stop scalp flaking, measure exact 1 mL doses, and soothe skin sensitivity during your regrowth journey.',
        products: [
          CATALOG.NIZORAL_KETOCONAZOLE,
          CATALOG.CERAMIDE_FACIAL_MOISTURIZER,
          CATALOG.ROOT_SCALP_APPLICATOR,
        ],
      };
    case 'usage':
    case 'faq':
      return {
        sectionTitle: '🎯 Men’s Daily Application, Dosing & Routine Tools on Amazon',
        sectionSubtitle:
          'Upgrade your daily Minoxidil routine with zero-waste root applicators, adjustable titanium stamps, and overnight hair protection.',
        products: [
          CATALOG.ROOT_SCALP_APPLICATOR,
          CATALOG.DERMA_STAMP_ADJUSTABLE,
          CATALOG.SATIN_PILLOWCASE_SET,
        ],
      };
    case 'comparison':
    case 'reviews':
      return {
        sectionTitle: '⭐ Highest-Rated Men’s Hair Regrowth Products & Kits on Amazon',
        sectionSubtitle:
          'Compare top-selling topical foam kits, titanium microneedling stamps, and botanical growth oils.',
        products: [
          CATALOG.MENS_5PCT_FOAM_KIT,
          CATALOG.DERMA_STAMP_ADJUSTABLE,
          CATALOG.CASTOR_ROSEMARY_OIL,
        ],
      };
    default:
      return {
        sectionTitle: '🏆 #1 Best-Selling Men’s Hair & Beard Grooming Essentials on Amazon',
        sectionSubtitle:
          'Pair your Minoxidil regimen with the top-rated tools recommended by hair restoration specialists across the USA.',
        products: [
          CATALOG.DERMA_STAMP_ADJUSTABLE,
          CATALOG.NIZORAL_KETOCONAZOLE,
          CATALOG.PHILIPS_BEARD_TRIMMER,
        ],
      };
  }
}
