import { db } from "./index";
import {
  collections,
  artworks,
  journalArticles,
  spacesContent,
  paymentSettings,
  orders,
  bids,
  analyticsEvents,
  inquiries,
} from "./schema";

export async function seedDatabase() {
  try {
    const existingColls = await db.select().from(collections);
    if (existingColls.length > 0) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Seeding ARTÉVO database (Naira pricing)...");

    const collectionData = [
      {
        slug: "african-soul",
        name: "African Soul",
        subtitle: "Heritage, Roots & Ancestral Resonances",
        description:
          "Deep textures, earthy pigments, and ceremonial silhouettes that bridge ancient symbolism with contemporary minimalism. Each piece honors the lineage and spiritual vitality of the continent.",
        coverImage: "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: true,
        displayOrder: 1,
      },
      {
        slug: "form",
        name: "Form",
        subtitle: "Architectural Geometry & Sculptural Lineage",
        description:
          "Bold geometric structures, architectural shadows, and spatial harmonies designed for modern sanctuaries, penthouses, and minimalist interiors.",
        coverImage: "https://images.pexels.com/photos/1582547/pexels-photo-1582547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: true,
        displayOrder: 2,
      },
      {
        slug: "still",
        name: "Still",
        subtitle: "Meditative Monochromes & Quiet Spaces",
        description:
          "Subtle gradations of ivory, raw stone, charcoal, and ochre. Created to inspire introspection and bring tranquility to living spaces and executive suites.",
        coverImage: "https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: true,
        displayOrder: 3,
      },
      {
        slug: "urban",
        name: "Urban",
        subtitle: "Metropolitan Energy & Neo-African Rhythm",
        description:
          "Capturing the vibrant pulse of Lagos, Nairobi, Johannesburg, and Accra through layered mixed-media textures, street typography, and dynamic brushstrokes.",
        coverImage: "https://images.pexels.com/photos/7244319/pexels-photo-7244319.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: true,
        displayOrder: 4,
      },
      {
        slug: "faith",
        name: "Faith",
        subtitle: "Spiritual Light & Transcendental Canvas",
        description:
          "Gold leaf accents, radiant ethereal tones, and transcendent motifs exploring hope, grace, and divine presence across contemporary West and East African art traditions.",
        coverImage: "https://images.pexels.com/photos/17828004/pexels-photo-17828004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: false,
        displayOrder: 5,
      },
      {
        slug: "human",
        name: "Human",
        subtitle: "Figurative Grace & Contemporary Identity",
        description:
          "Striking portraits and expressive human studies examining intimacy, memory, resilience, and the evolving Black aesthetic.",
        coverImage: "https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: true,
        displayOrder: 6,
      },
      {
        slug: "memory",
        name: "Memory",
        subtitle: "Nostalgic Horizons & Nostalgia of Place",
        description:
          "Soft dreamscapes, vintage sepia washes, and landscape abstractions evoking childhood homes, coastlines, and ancestral memories.",
        coverImage: "https://images.pexels.com/photos/38811106/pexels-photo-38811106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: false,
        displayOrder: 7,
      },
      {
        slug: "custom",
        name: "Custom & Commissions",
        subtitle: "Tailored Curation & Architectural Scale Works",
        description:
          "Bespoke creations designed exclusively for private residences, hotel lobbies, corporate headquarters, and luxury developments.",
        coverImage: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: false,
        displayOrder: 8,
      },
    ];

    await db.insert(collections).values(collectionData);

    // Naira-denominated size tiers
    const defaultSizes = [
      { size: "Medium (24 × 36 in / 60 × 90 cm)", price: 850000, dimensions: "24x36 inches" },
      { size: "Large (36 × 48 in / 90 × 120 cm)", price: 1450000, dimensions: "36x48 inches" },
      { size: "Grand Statement (48 × 72 in / 120 × 180 cm)", price: 2400000, dimensions: "48x72 inches" },
    ];

    const defaultFrames = [
      "Obsidian Ebonized Hardwood Frame",
      "Terracotta Solid Walnut Float Frame",
      "Muted Gold Brushed Aluminum Frame",
      "Museum Acrylic Unframed Wrapped Canvas",
    ];

    const artworkData = [
      {
        slug: "echoes-of-ancestry-no-3",
        title: "Echoes of Ancestry No. 3",
        artist: "Amina K. Bello",
        collectionSlug: "african-soul",
        story:
          "A masterpiece of earthy pigment and layered gesso, 'Echoes of Ancestry No. 3' explores the silent dialogues between historical West African bronzes and modern architectural sanctuaries. The muted terracotta strokes anchor the composition, while subtle gold leaf accents echo royal regalia.",
        price: 1250000,
        refCode: "ART-AFR-001",
        image: "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: [
          "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "https://images.pexels.com/photos/8251477/pexels-photo-8251477.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        sizeOptions: defaultSizes,
        orientation: "Portrait",
        editionType: "Limited Edition (1/25)",
        framingOptions: defaultFrames,
        inStock: true,
        featured: true,
        watermarkEnabled: true,
        auctionEnabled: true,
        minBid: 1200000,
        bidIncrement: 100000,
        auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        auctionStatus: "active",
        currentHighestBid: 1600000,
      },
      {
        slug: "monolith-of-the-savannah",
        title: "Monolith of the Savannah",
        artist: "Kwame Osei",
        collectionSlug: "form",
        story:
          "Constructed with structural geometric precision, this piece pays tribute to traditional Great Zimbabwe masonry and contemporary brutalist architecture. Deep obsidian shadows interact with warm stone hues to establish an authoritative visual center in any minimalist room.",
        price: 1850000,
        refCode: "ART-FRM-002",
        image: "https://images.pexels.com/photos/1582547/pexels-photo-1582547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: [
          "https://images.pexels.com/photos/1582547/pexels-photo-1582547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        sizeOptions: defaultSizes,
        orientation: "Landscape",
        editionType: "Original Monotype",
        framingOptions: defaultFrames,
        inStock: true,
        featured: true,
        watermarkEnabled: true,
        auctionEnabled: false,
      },
      {
        slug: "serengeti-at-dawn",
        title: "Serengeti at Dawn",
        artist: "Njabulo Dlamini",
        collectionSlug: "still",
        story:
          "An exercise in profound stillness and meditative tone. Sweeping horizontal washes of ivory, warm sand, and charcoal convey the first light illuminating East Africa's boundless horizon. Ideal for serene bedrooms and private reading studies.",
        price: 980000,
        refCode: "ART-STL-003",
        image: "https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: [
          "https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        sizeOptions: defaultSizes,
        orientation: "Landscape",
        editionType: "Limited Edition (1/50)",
        framingOptions: defaultFrames,
        inStock: true,
        featured: true,
        watermarkEnabled: true,
        auctionEnabled: false,
      },
      {
        slug: "lagos-rhythm-no-7",
        title: "Lagos Rhythm No. 7",
        artist: "Tunde Adebayo",
        collectionSlug: "urban",
        story:
          "Energetic, textured, and unapologetically bold. Tunde Adebayo captures the electric motion of Victoria Island at twilight through impasto oil strokes, indigo washes, and metallic accents reflecting streetlights and harbor reflections.",
        price: 1600000,
        refCode: "ART-URB-004",
        image: "https://images.pexels.com/photos/7244319/pexels-photo-7244319.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: [
          "https://images.pexels.com/photos/7244319/pexels-photo-7244319.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        sizeOptions: defaultSizes,
        orientation: "Portrait",
        editionType: "Original Mixed Media",
        framingOptions: defaultFrames,
        inStock: true,
        featured: true,
        watermarkEnabled: true,
        auctionEnabled: true,
        minBid: 1500000,
        bidIncrement: 100000,
        auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        auctionStatus: "active",
        currentHighestBid: 1900000,
      },
      {
        slug: "golden-benin-sovereignty",
        title: "Golden Benin Sovereignty",
        artist: "Efe Oghene",
        collectionSlug: "faith",
        story:
          "Hand-applied 24k gold leaf details accentuate stylized royal mask iconography in this majestic piece. 'Golden Benin Sovereignty' embodies historical dignity and spiritual light, elevating dining halls and high-ceiling foyers.",
        price: 2800000,
        refCode: "ART-FTH-005",
        image: "https://images.pexels.com/photos/17828004/pexels-photo-17828004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: [
          "https://images.pexels.com/photos/17828004/pexels-photo-17828004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        sizeOptions: defaultSizes,
        orientation: "Square",
        editionType: "Limited Edition (1/10)",
        framingOptions: defaultFrames,
        inStock: true,
        featured: true,
        watermarkEnabled: true,
        auctionEnabled: false,
      },
      {
        slug: "the-matriarchs-gaze",
        title: "The Matriarch's Gaze",
        artist: "Zola Ndebele",
        collectionSlug: "human",
        story:
          "A soul-stirring figurative portrait emphasizing wisdom, quiet poise, and timeless beauty. Rendered in charcoal, burnt sienna, and ivory impasto, this artwork radiates warmth and commanding presence.",
        price: 1950000,
        refCode: "ART-HMN-006",
        image: "https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: [
          "https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        sizeOptions: defaultSizes,
        orientation: "Portrait",
        editionType: "Original Acrylic on Linen",
        framingOptions: defaultFrames,
        inStock: true,
        featured: true,
        watermarkEnabled: true,
        auctionEnabled: false,
      },
      {
        slug: "whispers-of-kigali",
        title: "Whispers of Kigali",
        artist: "Jean-Paul Mutanguha",
        collectionSlug: "memory",
        story:
          "Soft, ethereal misty hills rendered in terracotta, olive, and warm stone. 'Whispers of Kigali' offers a poetic reflection on memory, healing, and the serene landscapes of the Thousand Hills.",
        price: 1100000,
        refCode: "ART-MMR-007",
        image: "https://images.pexels.com/photos/38811106/pexels-photo-38811106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: [
          "https://images.pexels.com/photos/38811106/pexels-photo-38811106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        sizeOptions: defaultSizes,
        orientation: "Landscape",
        editionType: "Limited Edition (1/25)",
        framingOptions: defaultFrames,
        inStock: true,
        featured: false,
        watermarkEnabled: true,
        auctionEnabled: false,
      },
      {
        slug: "the-grand-atrium-diptych",
        title: "The Grand Atrium Diptych",
        artist: "ARTÉVO Master Studio",
        collectionSlug: "custom",
        story:
          "Commissioned specifically for architectural spaces exceeding 12 feet in ceiling height. Featuring textured plaster, raw ochre pigment, and obsidian charcoal lines across two monumental canvases.",
        price: 4500000,
        refCode: "ART-CST-008",
        image: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: [
          "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "https://images.pexels.com/photos/1582547/pexels-photo-1582547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ],
        sizeOptions: [
          { size: "Diptych Grand (60 × 96 in Total / 150 × 240 cm)", price: 4500000, dimensions: "60x96 inches total" },
          { size: "Monumental Custom Scale", price: 6800000, dimensions: "Custom Client Spec" },
        ],
        orientation: "Landscape",
        editionType: "Commission / Bespoke 1 of 1",
        framingOptions: defaultFrames,
        inStock: true,
        featured: true,
        watermarkEnabled: true,
        auctionEnabled: false,
      },
    ];

    await db.insert(artworks).values(artworkData);

    const articleData = [
      {
        slug: "curating-contemporary-african-art-for-modern-luxury-interiors",
        title: "Curating Contemporary African Art for Modern Luxury Interiors",
        excerpt:
          "How leading interior architects are integrating rich African textures, earth pigments, and architectural art pieces into residential sanctuaries.",
        content: `
Contemporary African art has moved far beyond traditional galleries into the world's most sophisticated architectural residences. When styling luxury spaces—whether a sea-view penthouse in Lekki or a minimalist apartment in London—artwork acts as the emotional anchor.

### 1. The Harmony of Raw Texture & Clean Architecture
Modern architecture leans heavily into polished concrete, white oak, and expansive floor-to-ceiling glass. To prevent spaces from feeling sterile, works like *Echoes of Ancestry No. 3* inject visceral warmth. The juxtaposition of rough, organic earth pigments against smooth marble creates an instantly refined ambiance.

### 2. Scale & Proportions: The Grand Statement
Never under-scale your main living space artwork. A single 48 × 72 inch framed monotype commands attention, establishes focus, and eliminates the visual clutter of multiple small prints.

### 3. Framing as Architectural Furniture
At ARTÉVO, our frames are crafted from ebonized hardwood and solid walnut. They match the cabinetry and architectural woodwork of high-end homes, ensuring seamless cohesion between art and interior design.
        `,
        author: "Kemi Adeleke, Senior Art Curator",
        category: "Interior Styling",
        coverImage: "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        collectionSlug: "african-soul",
        published: true,
        readTime: "6 min read",
      },
      {
        slug: "the-resurgence-of-monochrome-in-african-abstraction",
        title: "The Resurgence of Monochrome in African Abstraction",
        excerpt:
          "Exploring how artists like Kwame Osei and Njabulo Dlamini use tone, silence, and shadow to redefine modern heritage.",
        content: `
In recent years, African contemporary art has witnessed a fascinating shift toward minimalism and monochromatic palettes. Away from hyper-vibrant color saturation, artists are using silence as a medium.

By limiting color to subtle charcoal, raw ivory, and stone, the viewer is forced to interact with line, depth, and spatial vibration. This philosophy sits at the heart of ARTÉVO's **Still** collection.
        `,
        author: "Julian Vance, Art Historian",
        category: "African Contemporary",
        coverImage: "https://images.pexels.com/photos/8251476/pexels-photo-8251476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        collectionSlug: "still",
        published: true,
        readTime: "4 min read",
      },
      {
        slug: "investing-in-limited-editions-a-collectors-handbook",
        title: "Investing in Limited Editions: A Collector's Handbook",
        excerpt:
          "Understanding edition numbering, archival museum-grade rag paper, hand-signed certificates, and value appreciation in Naira-denominated acquisitions.",
        content: `
For emerging and seasoned collectors alike, limited edition fine art prints offer a remarkably accessible gateway to museum-quality contemporary art.

At ARTÉVO, every edition in our **Limited** series is restricted to strictly 25 or 50 pieces worldwide, printed on 310gsm Hahnemühle Photo Rag cotton paper, inspected and hand-embossed with the ARTÉVO seal of authenticity.
        `,
        author: "ARTÉVO Advisory Team",
        category: "Collector Guide",
        coverImage: "https://images.pexels.com/photos/38811106/pexels-photo-38811106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        collectionSlug: "form",
        published: true,
        readTime: "5 min read",
      },
    ];

    await db.insert(journalArticles).values(articleData);

    const spacesData = [
      {
        spaceKey: "editions",
        title: "ARTÉVO Editions",
        subtitle: "Curated Fine Art Prints for Elevated Residential Spaces",
        heroImage: "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        description:
          "ARTÉVO Editions brings gallery-grade contemporary art into refined homes. Every piece is printed on archival 310gsm cotton rag, framed in hand-finished hardwood, and sealed with our signature watermark and embossed stamp.",
        features: [
          { title: "Archival Quality", desc: "100+ year museum color permanence guarantee using pigment inks." },
          { title: "Custom Framing", desc: "Ebonized black oak, terracotta walnut, or floating gold aluminum." },
          { title: "Ready to Hang", desc: "Integrated heavy-duty French cleat hanging hardware included." },
        ],
        caseStudies: [
          {
            title: "Bodija Residences Curation",
            client: "Private Residential Client",
            location: "Ibadan, Nigeria",
            description: "Curated 14 large-format pieces across the main salon, grand hallway, and master suite for a private Ibadan home.",
            image: "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            year: "2026",
          },
          {
            title: "Jericho Hills Estate",
            client: "Private Estate Client",
            location: "Ibadan, Nigeria",
            description: "Selected monochromatic abstracts from the Still and Form collections for a contemporary Ibadan sanctuary.",
            image: "https://images.pexels.com/photos/8251477/pexels-photo-8251477.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            year: "2026",
          },
        ],
        ctaTitle: "Transform Your Home with ARTÉVO Editions",
        ctaText: "Explore our ready-to-ship curated editions or request a complimentary digital mock-up for your living room wall.",
      },
      {
        spaceKey: "limited",
        title: "ARTÉVO Limited",
        subtitle: "Rare, Hand-Signed & strictly Numbered Collector Series",
        heroImage: "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        description:
          "Reserved for serious collectors and art connoisseurs. ARTÉVO Limited comprises rare runs of 10 to 25 hand-signed monotypes and mixed-media works accompanied by physical Certificates of Authenticity registered on the ARTÉVO Collector Ledger.",
        features: [
          { title: "Strictly Limited Runs", desc: "Never re-issued once the edition allocation is exhausted." },
          { title: "Hand-Signed & Embossed", desc: "Individually signed by the artist and embossed by ARTÉVO Studio." },
          { title: "Provenance Ledger", desc: "Secured physical certificate with unique serial tracking." },
        ],
        caseStudies: [
          {
            title: "The Sovereign Suite Curation",
            client: "The Sovereign Club",
            location: "Accra, Ghana",
            description: "Acquired 5 rare gold-leaf limited monotypes for their executive lounge.",
            image: "https://images.pexels.com/photos/17828004/pexels-photo-17828004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            year: "2025",
          },
        ],
        ctaTitle: "Acquire a Rare ARTÉVO Limited Piece",
        ctaText: "Discover exclusive numbered works currently available for private acquisition or auction.",
      },
      {
        spaceKey: "custom",
        title: "ARTÉVO Custom",
        subtitle: "Bespoke Art Commissions for Penthouses, Estates & Private Clients",
        heroImage: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        description:
          "Collaborate directly with our master artists and curatorial directors to create one-of-a-kind artworks tailored to your exact architectural dimensions, color palette, and spiritual intent.",
        features: [
          { title: "Scale Without Limit", desc: "Specializing in monumental wall installations up to 20 feet." },
          { title: "Palette Matching", desc: "We harmonize paint swatches, stone samples, and interior textiles." },
          { title: "Virtual Preview", desc: "Receive 3D render mockups before canvas production begins." },
        ],
        caseStudies: [
          {
            title: "Monumental Atrium Canvas",
            client: "Ibadan Private Estate",
            location: "Ibadan, Nigeria",
            description: "A 16-foot custom triptych incorporating local clay soils and liquid gold leaf for a private Oyo estate.",
            image: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            year: "2026",
          },
        ],
        ctaTitle: "Commission Your Custom Artwork",
        ctaText: "Schedule a private consultation with our Chief Art Curator to discuss your vision and space requirements.",
      },
      {
        spaceKey: "spaces",
        title: "ARTÉVO Hospitality & Corporate Spaces",
        subtitle: "Comprehensive Curation for Luxury Hotels, Offices & Flagships",
        heroImage: "https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        description:
          "We partner with hospitality groups, corporate headquarters, luxury resorts, and high-end dining establishments across Africa, Europe, and the Middle East to deliver cohesive, meaningful art collections.",
        features: [
          { title: "Turnkey Curation", desc: "From concept development to framing, shipping, and white-glove installation." },
          { title: "Acoustic & Fire Rated", desc: "Hospitality-grade archival canvases meeting commercial standards." },
          { title: "Volume & Schedule Management", desc: "Streamlined production for multi-room hotel developments." },
        ],
        caseStudies: [
          {
            title: "The Radisson Blu Executive Suites",
            client: "Radisson Hotel Group",
            location: "Nairobi, Kenya",
            description: "Outfitted 68 guest suites and public corridors with framed African Soul artwork.",
            image: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            year: "2025",
          },
          {
            title: "Zenith Capital HQ Tower",
            client: "Zenith Holdings",
            location: "Johannesburg, SA",
            description: "Curated 22 large-format sculptural pieces for executive boardrooms and reception spaces.",
            image: "https://images.pexels.com/photos/1582547/pexels-photo-1582547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            year: "2024",
          },
        ],
        ctaTitle: "Elevate Your Commercial & Hospitality Space",
        ctaText: "Contact our Trade & Commercial Curation Division to request our corporate portfolio and project pricing.",
      },
    ];

    await db.insert(spacesContent).values(spacesData);

    // Nigerian Naira bank transfer configuration
    await db.insert(paymentSettings).values({
      bankName: "Guaranty Trust Bank (GTBank) — Ibadan, Oyo State",
      accountName: "ARTÉVO NIGERIA LIMITED",
      accountNumber: "0192837465",
      sortCodeOrSwift: "GTBINGLA / SWIFT: GTBIGLAX",
      currency: "Nigerian Naira (₦)",
      instructions:
        "Please transfer the exact Naira order amount to the official ARTÉVO Ibadan account above. Include your Order Reference Code (e.g. ARTEVO-ORD-8942) as the transfer narration. Once completed, click 'I Have Made Payment' and enter your bank transfer reference. For assistance WhatsApp 0903 019 2034.",
      contactEmail: "mobolajiolakunle8@gmail.com",
    });

    await db.insert(orders).values([
      {
        orderRef: "ARTEVO-ORD-8942",
        artworkId: 1,
        artworkTitle: "Echoes of Ancestry No. 3",
        artworkRef: "ART-AFR-001",
        selectedSize: "Large (36 × 48 in)",
        selectedFraming: "Obsidian Ebonized Hardwood Frame",
        amount: 1450000,
        customerName: "Dr. Olayinka Sanusi",
        customerEmail: "sanusi.olayinka@example.com",
        customerPhone: "+234 803 123 4567",
        shippingAddress: "12 Ring Road, Ibadan, Oyo State",
        country: "Nigeria",
        notes: "Please deliver before 5 PM on Friday.",
        paymentProofRef: "TRX-GTB-9921038",
        status: "Payment Submitted",
        paymentMethod: "Bank Transfer",
      },
      {
        orderRef: "ARTEVO-ORD-7731",
        artworkId: 2,
        artworkTitle: "Monolith of the Savannah",
        artworkRef: "ART-FRM-002",
        selectedSize: "Medium (24 × 36 in)",
        selectedFraming: "Terracotta Solid Walnut Float Frame",
        amount: 1850000,
        customerName: "Sarah Jenkins",
        customerEmail: "s.jenkins@mayfairdesign.co.uk",
        customerPhone: "+44 7700 900077",
        shippingAddress: "42 Berkeley Square, Mayfair, London W1J 5AW",
        country: "United Kingdom",
        notes: "Commercial invoice required for corporate accounting.",
        paymentProofRef: "BARCLAYS-98124501",
        status: "Paid",
        paymentMethod: "Bank Transfer",
      },
      {
        orderRef: "ARTEVO-ORD-6102",
        artworkId: 3,
        artworkTitle: "Serengeti at Dawn",
        artworkRef: "ART-STL-003",
        selectedSize: "Grand Statement (48 × 72 in)",
        selectedFraming: "Muted Gold Brushed Aluminum Frame",
        amount: 2400000,
        customerName: "Jean-Luc Moreau",
        customerEmail: "jlmoreau@luxuryparis.fr",
        customerPhone: "+33 6 12 34 56 78",
        shippingAddress: "18 Avenue Montaigne, 75008 Paris",
        country: "France",
        paymentProofRef: "BNP-8823104",
        status: "Processing & Framing",
        paymentMethod: "Bank Transfer",
      },
    ]);

    await db.insert(bids).values([
      {
        artworkId: 1,
        bidderName: "Marcus Vance",
        bidderEmail: "m.vance@vancecollect.com",
        bidderPhone: "+1 212 555 0192",
        amount: 1400000,
        status: "outbid",
      },
      {
        artworkId: 1,
        bidderName: "Chief Adebayo",
        bidderEmail: "adebayo.c@holding.ng",
        bidderPhone: "+234 802 999 1122",
        amount: 1600000,
        status: "active",
      },
    ]);

    await db.insert(analyticsEvents).values([
      { eventType: "page_view", path: "/" },
      { eventType: "page_view", path: "/collections" },
      { eventType: "artwork_view", path: "/artwork/echoes-of-ancestry-no-3", artworkSlug: "echoes-of-ancestry-no-3" },
      { eventType: "cta_click", path: "/", meta: { button: "Get this Piece", refCode: "ART-AFR-001" } },
    ]);

    await db.insert(inquiries).values([
      {
        type: "Hospitality & Commercial",
        name: "Claire Dupont",
        email: "c.dupont@boutiquehotels.com",
        phone: "+33 1 42 68 55 00",
        company: "Le Riviera Boutique Hotels",
        message: "We are developing a 40-room luxury hotel in Marrakech and would like a comprehensive curation proposal.",
        status: "New",
      },
    ]);

    console.log("ARTÉVO database successfully seeded (₦ Naira pricing)!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
