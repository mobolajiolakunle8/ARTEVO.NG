/**
 * Static ARTÉVO catalog used when PostgreSQL is unreachable (e.g. a fresh
 * Vercel deployment without DATABASE_URL yet). Keeps the public website fully
 * browsable; admin actions and orders simply require the database.
 * All prices in Nigerian Naira (₦).
 */
const iso = (daysFromNow: number, base = Date.now()) =>
  new Date(base + daysFromNow * 86_400_000).toISOString();

export const FALLBACK_COLLECTIONS = [
  { id: 1, slug: "african-soul", name: "African Soul", subtitle: "Heritage, Roots & Ancestral Resonances", description: "Deep textures, earthy pigments, and ceremonial silhouettes that bridge ancient symbolism with contemporary minimalism.", coverImage: "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, displayOrder: 1, createdAt: iso(-30) },
  { id: 2, slug: "form", name: "Form", subtitle: "Architectural Geometry & Sculptural Lineage", description: "Bold geometric structures, architectural shadows, and spatial harmonies designed for modern sanctuaries.", coverImage: "https://images.pexels.com/photos/1582547/pexels-photo-1582547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, displayOrder: 2, createdAt: iso(-30) },
  { id: 3, slug: "still", name: "Still", subtitle: "Meditative Monochromes & Quiet Spaces", description: "Subtle gradations of ivory, raw stone, charcoal, and ochre for living spaces and executive suites.", coverImage: "https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, displayOrder: 3, createdAt: iso(-30) },
  { id: 4, slug: "urban", name: "Urban", subtitle: "Metropolitan Energy & Neo-African Rhythm", description: "Layered mixed-media textures, street typography, and dynamic brushstrokes from Lagos to Accra.", coverImage: "https://images.pexels.com/photos/7244319/pexels-photo-7244319.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, displayOrder: 4, createdAt: iso(-30) },
  { id: 5, slug: "faith", name: "Faith", subtitle: "Spiritual Light & Transcendental Canvas", description: "Gold leaf accents and transcendent motifs exploring hope, grace, and divine presence.", coverImage: "https://images.pexels.com/photos/17828004/pexels-photo-17828004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, displayOrder: 5, createdAt: iso(-30) },
  { id: 6, slug: "human", name: "Human", subtitle: "Figurative Grace & Contemporary Identity", description: "Striking portraits and expressive human studies examining identity, resilience, and beauty.", coverImage: "https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: true, displayOrder: 6, createdAt: iso(-30) },
  { id: 7, slug: "memory", name: "Memory", subtitle: "Nostalgic Horizons & Nostalgia of Place", description: "Soft dreamscapes and landscape abstractions evoking childhood homes and ancestral memories.", coverImage: "https://images.pexels.com/photos/38811106/pexels-photo-38811106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, displayOrder: 7, createdAt: iso(-30) },
  { id: 8, slug: "custom", name: "Custom & Commissions", subtitle: "Tailored Curation & Architectural Scale Works", description: "Bespoke creations designed exclusively for private residences, hotels, and corporate headquarters.", coverImage: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", featured: false, displayOrder: 8, createdAt: iso(-30) },
];

const sizes = [
  { size: "Medium (24 × 36 in / 60 × 90 cm)", price: 850000, dimensions: "24x36 inches" },
  { size: "Large (36 × 48 in / 90 × 120 cm)", price: 1450000, dimensions: "36x48 inches" },
  { size: "Grand Statement (48 × 72 in / 120 × 180 cm)", price: 2400000, dimensions: "48x72 inches" },
];
const frames = [
  "Obsidian Ebonized Hardwood Frame",
  "Terracotta Solid Walnut Float Frame",
  "Muted Gold Brushed Aluminum Frame",
  "Museum Acrylic Unframed Wrapped Canvas",
];

export const FALLBACK_ARTWORKS = [
  {
    id: 1, slug: "echoes-of-ancestry-no-3", title: "Echoes of Ancestry No. 3", artist: "Amina K. Bello",
    collectionSlug: "african-soul",
    story: "A masterpiece of earthy pigment and layered gesso exploring the silent dialogues between historical West African bronzes and modern architectural sanctuaries. Muted terracotta strokes anchor the composition while subtle gold leaf accents echo royal regalia.",
    price: 1250000, refCode: "ART-AFR-001",
    image: "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    ],
    sizeOptions: sizes, orientation: "Portrait", editionType: "Limited Edition (1/25)", framingOptions: frames,
    inStock: true, featured: true, watermarkEnabled: true, auctionEnabled: true,
    minBid: 1200000, bidIncrement: 100000, auctionEndTime: iso(5), auctionStatus: "active", currentHighestBid: 1600000,
    createdAt: iso(-21),
  },
  {
    id: 2, slug: "monolith-of-the-savannah", title: "Monolith of the Savannah", artist: "Kwame Osei",
    collectionSlug: "form",
    story: "Structural geometric precision paying tribute to Great Zimbabwe masonry and contemporary brutalist architecture. Deep obsidian shadows interact with warm stone hues to establish an authoritative visual center.",
    price: 1850000, refCode: "ART-FRM-002", image: "https://images.pexels.com/photos/1582547/pexels-photo-1582547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: ["https://images.pexels.com/photos/1582547/pexels-photo-1582547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    sizeOptions: sizes, orientation: "Landscape", editionType: "Original Monotype", framingOptions: frames,
    inStock: true, featured: true, watermarkEnabled: true, auctionEnabled: false,
    minBid: 0, bidIncrement: 50, auctionEndTime: null, auctionStatus: "none", currentHighestBid: 0,
    createdAt: iso(-19),
  },
  {
    id: 3, slug: "serengeti-at-dawn", title: "Serengeti at Dawn", artist: "Njabulo Dlamini",
    collectionSlug: "still",
    story: "An exercise in profound stillness and meditative tone. Sweeping horizontal washes of ivory, warm sand, and charcoal convey the first light illuminating East Africa's boundless horizon.",
    price: 980000, refCode: "ART-STL-003", image: "https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: ["https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    sizeOptions: sizes, orientation: "Landscape", editionType: "Limited Edition (1/50)", framingOptions: frames,
    inStock: true, featured: true, watermarkEnabled: true, auctionEnabled: false,
    minBid: 0, bidIncrement: 50, auctionEndTime: null, auctionStatus: "none", currentHighestBid: 0,
    createdAt: iso(-17),
  },
  {
    id: 4, slug: "lagos-rhythm-no-7", title: "Lagos Rhythm No. 7", artist: "Tunde Adebayo",
    collectionSlug: "urban",
    story: "Energetic, textured, and unapologetically bold. Tunde Adebayo captures the electric motion of the city at twilight through impasto oil strokes, indigo washes, and metallic accents.",
    price: 1600000, refCode: "ART-URB-004", image: "https://images.pexels.com/photos/7244319/pexels-photo-7244319.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: ["https://images.pexels.com/photos/7244319/pexels-photo-7244319.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    sizeOptions: sizes, orientation: "Portrait", editionType: "Original Mixed Media", framingOptions: frames,
    inStock: true, featured: true, watermarkEnabled: true, auctionEnabled: true,
    minBid: 1500000, bidIncrement: 100000, auctionEndTime: iso(3), auctionStatus: "active", currentHighestBid: 1900000,
    createdAt: iso(-14),
  },
  {
    id: 5, slug: "golden-benin-sovereignty", title: "Golden Benin Sovereignty", artist: "Efe Oghene",
    collectionSlug: "faith",
    story: "Hand-applied 24k gold leaf details accentuate stylized royal mask iconography. Embodies historical dignity and spiritual light for dining halls and high-ceiling foyers.",
    price: 2800000, refCode: "ART-FTH-005", image: "https://images.pexels.com/photos/17828004/pexels-photo-17828004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: ["https://images.pexels.com/photos/17828004/pexels-photo-17828004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    sizeOptions: sizes, orientation: "Square", editionType: "Limited Edition (1/10)", framingOptions: frames,
    inStock: true, featured: true, watermarkEnabled: true, auctionEnabled: false,
    minBid: 0, bidIncrement: 50, auctionEndTime: null, auctionStatus: "none", currentHighestBid: 0,
    createdAt: iso(-11),
  },
  {
    id: 6, slug: "the-matriarchs-gaze", title: "The Matriarch's Gaze", artist: "Zola Ndebele",
    collectionSlug: "human",
    story: "A soul-stirring figurative portrait emphasizing wisdom, quiet poise, and timeless beauty. Rendered in charcoal, burnt sienna, and ivory impasto.",
    price: 1950000, refCode: "ART-HMN-006", image: "https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: ["https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    sizeOptions: sizes, orientation: "Portrait", editionType: "Original Acrylic on Linen", framingOptions: frames,
    inStock: true, featured: true, watermarkEnabled: true, auctionEnabled: false,
    minBid: 0, bidIncrement: 50, auctionEndTime: null, auctionStatus: "none", currentHighestBid: 0,
    createdAt: iso(-8),
  },
  {
    id: 7, slug: "whispers-of-kigali", title: "Whispers of Kigali", artist: "Jean-Paul Mutanguha",
    collectionSlug: "memory",
    story: "Soft, ethereal misty hills rendered in terracotta, olive, and warm stone. A poetic reflection on memory, healing, and the serene landscapes of the Thousand Hills.",
    price: 1100000, refCode: "ART-MMR-007", image: "https://images.pexels.com/photos/38811106/pexels-photo-38811106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: ["https://images.pexels.com/photos/38811106/pexels-photo-38811106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    sizeOptions: sizes, orientation: "Landscape", editionType: "Limited Edition (1/25)", framingOptions: frames,
    inStock: true, featured: false, watermarkEnabled: true, auctionEnabled: false,
    minBid: 0, bidIncrement: 50, auctionEndTime: null, auctionStatus: "none", currentHighestBid: 0,
    createdAt: iso(-5),
  },
  {
    id: 8, slug: "the-grand-atrium-diptych", title: "The Grand Atrium Diptych", artist: "ARTÉVO Master Studio",
    collectionSlug: "custom",
    story: "Commissioned specifically for architectural spaces exceeding 12 feet in ceiling height. Textured plaster, raw ochre pigment, and obsidian charcoal lines across two monumental canvases.",
    price: 4500000, refCode: "ART-CST-008", image: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: ["https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
    sizeOptions: [
      { size: "Diptych Grand (60 × 96 in Total)", price: 4500000, dimensions: "60x96 inches total" },
      { size: "Monumental Custom Scale", price: 6800000, dimensions: "Custom Client Spec" },
    ],
    orientation: "Landscape", editionType: "Commission / Bespoke 1 of 1", framingOptions: frames,
    inStock: true, featured: true, watermarkEnabled: true, auctionEnabled: false,
    minBid: 0, bidIncrement: 50, auctionEndTime: null, auctionStatus: "none", currentHighestBid: 0,
    createdAt: iso(-2),
  },
];

export const FALLBACK_ARTICLES = [
  {
    id: 1, slug: "curating-contemporary-african-art-for-modern-luxury-interiors",
    title: "Curating Contemporary African Art for Modern Luxury Interiors",
    excerpt: "How leading interior architects are integrating rich African textures, earth pigments, and architectural art pieces into residential sanctuaries.",
    content: "Contemporary African art has moved far beyond traditional galleries into the world's most sophisticated architectural residences. When styling luxury spaces—whether a sea-view penthouse in Lekki or a minimalist apartment in London—artwork acts as the emotional anchor.\n\n## 1. The Harmony of Raw Texture & Clean Architecture\nModern architecture leans heavily into polished concrete, white oak, and expansive floor-to-ceiling glass.\n\n## 2. Scale & Proportions\nNever under-scale your main living space artwork. A single 48 × 72 inch framed monotype commands attention.\n\n## 3. Framing as Architectural Furniture\nAt ARTÉVO, our frames are crafted from ebonized hardwood and solid walnut.",
    author: "Kemi Adeleke, Senior Art Curator", category: "Interior Styling",
    coverImage: "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    collectionSlug: "african-soul", published: true, readTime: "6 min read", createdAt: iso(-12),
  },
  {
    id: 2, slug: "the-resurgence-of-monochrome-in-african-abstraction",
    title: "The Resurgence of Monochrome in African Abstraction",
    excerpt: "Exploring how artists like Kwame Osei and Njabulo Dlamini use tone, silence, and shadow to redefine modern heritage.",
    content: "In recent years, African contemporary art has witnessed a fascinating shift toward minimalism and monochromatic palettes. By limiting color to subtle charcoal, raw ivory, and stone, the viewer is forced to interact with line, depth, and spatial vibration. This philosophy sits at the heart of ARTÉVO's Still collection.",
    author: "Julian Vance, Art Historian", category: "African Contemporary",
    coverImage: "https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    collectionSlug: "still", published: true, readTime: "4 min read", createdAt: iso(-9),
  },
  {
    id: 3, slug: "investing-in-limited-editions-a-collectors-handbook",
    title: "Investing in Limited Editions: A Collector's Handbook",
    excerpt: "Understanding edition numbering, archival museum-grade rag paper, hand-signed certificates, and value appreciation in Naira-denominated acquisitions.",
    content: "For emerging and seasoned collectors alike, limited edition fine art prints offer a remarkably accessible gateway to museum-quality contemporary art. At ARTÉVO, every edition in our Limited series is restricted to strictly 25 or 50 pieces worldwide, printed on 310gsm Hahnemühle Photo Rag cotton paper.",
    author: "ARTÉVO Advisory Team", category: "Collector Guide",
    coverImage: "https://images.pexels.com/photos/38811106/pexels-photo-38811106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    collectionSlug: "form", published: true, readTime: "5 min read", createdAt: iso(-6),
  },
];

export const FALLBACK_SPACES = [
  {
    id: 1, spaceKey: "editions", title: "ARTÉVO Editions",
    subtitle: "Curated Fine Art Prints for Elevated Residential Spaces",
    heroImage: "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description: "ARTÉVO Editions brings gallery-grade contemporary art into refined homes. Every piece is printed on archival 310gsm cotton rag, framed in hand-finished hardwood, and sealed with our signature watermark and embossed stamp.",
    features: [
      { title: "Archival Quality", desc: "100+ year museum color permanence guarantee." },
      { title: "Custom Framing", desc: "Ebonized black oak, terracotta walnut, or floating gold." },
      { title: "Ready to Hang", desc: "Heavy-duty French cleat hardware included." },
    ],
    caseStudies: [
      { title: "Bodija Residences Curation", client: "Private Residential Client", location: "Ibadan, Nigeria", description: "Curated 14 large-format pieces across the main salon and master suite.", image: "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", year: "2026" },
    ],
    ctaTitle: "Transform Your Home with ARTÉVO Editions",
    ctaText: "Explore our ready-to-ship curated editions or request a complimentary digital mock-up for your living room wall.",
    updatedAt: iso(-4),
  },
  {
    id: 2, spaceKey: "limited", title: "ARTÉVO Limited",
    subtitle: "Rare, Hand-Signed & strictly Numbered Collector Series",
    heroImage: "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description: "Reserved for serious collectors. ARTÉVO Limited comprises rare runs of 10 to 25 hand-signed works accompanied by physical Certificates of Authenticity registered on the ARTÉVO Collector Ledger.",
    features: [
      { title: "Strictly Limited Runs", desc: "Never re-issued once the edition is exhausted." },
      { title: "Hand-Signed & Embossed", desc: "Signed by the artist and embossed by ARTÉVO Studio." },
      { title: "Provenance Ledger", desc: "Physical certificate with unique serial tracking." },
    ],
    caseStudies: [
      { title: "The Sovereign Suite Curation", client: "The Sovereign Club", location: "Accra, Ghana", description: "Acquired 5 rare gold-leaf limited monotypes for their executive lounge.", image: "https://images.pexels.com/photos/17828004/pexels-photo-17828004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", year: "2026" },
    ],
    ctaTitle: "Acquire a Rare ARTÉVO Limited Piece",
    ctaText: "Discover exclusive numbered works currently available for private acquisition or auction.",
    updatedAt: iso(-4),
  },
  {
    id: 3, spaceKey: "custom", title: "ARTÉVO Custom",
    subtitle: "Bespoke Art Commissions for Penthouses, Estates & Private Clients",
    heroImage: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description: "Collaborate directly with our master artists and curatorial directors to create one-of-a-kind artworks tailored to your exact architectural dimensions, color palette, and spiritual intent.",
    features: [
      { title: "Scale Without Limit", desc: "Monumental wall installations up to 20 feet." },
      { title: "Palette Matching", desc: "We harmonize paint swatches with interior textiles." },
      { title: "Virtual Preview", desc: "3D render mockups before production begins." },
    ],
    caseStudies: [
      { title: "Monumental Atrium Canvas", client: "Ibadan Private Estate", location: "Ibadan, Nigeria", description: "A 16-foot custom triptych incorporating local clay soils and liquid gold leaf.", image: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", year: "2026" },
    ],
    ctaTitle: "Commission Your Custom Artwork",
    ctaText: "Schedule a private consultation with our Chief Art Curator to discuss your vision and space requirements.",
    updatedAt: iso(-4),
  },
  {
    id: 4, spaceKey: "spaces", title: "ARTÉVO Hospitality & Corporate Spaces",
    subtitle: "Comprehensive Curation for Luxury Hotels, Offices & Flagships",
    heroImage: "https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description: "We partner with hospitality groups, corporate headquarters, and luxury developments to deliver cohesive, meaningful art collections — from framing to white-glove installation.",
    features: [
      { title: "Turnkey Curation", desc: "Concept to framing, shipping, and installation." },
      { title: "Hospitality Grade", desc: "Archival canvases meeting commercial standards." },
      { title: "Volume Management", desc: "Streamlined production for multi-room hotels." },
    ],
    caseStudies: [
      { title: "Executive Suites Project", client: "Hotel Group", location: "Nairobi, Kenya", description: "Outfitted 68 guest suites with framed African Soul artwork.", image: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", year: "2026" },
    ],
    ctaTitle: "Elevate Your Commercial & Hospitality Space",
    ctaText: "Contact our Trade & Commercial Curation Division to request our corporate portfolio.",
    updatedAt: iso(-4),
  },
];

export const FALLBACK_PAYMENT = {
  id: 1,
  bankName: "Guaranty Trust Bank (GTBank) — Ibadan, Oyo State",
  accountName: "ARTÉVO NIGERIA LIMITED",
  accountNumber: "0192837465",
  sortCodeOrSwift: "GTBINGLA / SWIFT: GTBIGLAX",
  currency: "Nigerian Naira (₦)",
  instructions:
    "Please transfer the exact Naira order amount to the official ARTÉVO Ibadan account above. Include your Order Reference Code as the transfer narration. Once completed, click 'I Have Made Payment' and enter your bank transfer reference. For assistance WhatsApp 0903 019 2034.",
  contactEmail: "mobolajiolakunle8@gmail.com",
  updatedAt: iso(0),
};

export const FALLBACK_ORDERS: unknown[] = [];
export const FALLBACK_BIDS: unknown[] = [];
export const FALLBACK_INQUIRIES: unknown[] = [];
export const FALLBACK_EVENTS: unknown[] = [];
export const FALLBACK_SUBSCRIBERS: unknown[] = [];
