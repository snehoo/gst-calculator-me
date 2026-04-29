// Blog post content store. Body is rendered as structured blocks
// so we can match the site design system (semantic tokens, cards).

export type Block =
  | { type: "lead"; text: string }
  | { type: "p"; text: string } // supports inline <strong>, <em>, <a href>
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "stat"; num: string; label: string }
  | { type: "statGrid"; items: { n: string; l: string }[] }
  | { type: "slabGrid"; items: { r: string; l: string }[] }
  | { type: "formula"; title: string; code: string }
  | { type: "highlight"; html: string }
  | { type: "warn"; html: string }
  | { type: "example"; title: string; lines: string[] }
  | { type: "quote"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "checklist"; items: { mark?: string; html: string }[] }
  | { type: "invoiceFields"; items: { title: string; text: string }[] }
  | { type: "cta"; title: string; text: string };

export interface Post {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "how-to-calculate-gst",
    title: "How to Calculate GST in India — Formula, Examples and Shortcuts",
    description:
      "Learn how to calculate GST in India using simple formulas — GST-exclusive, GST-inclusive, and reverse GST — with worked examples for every tax slab.",
    category: "How-to",
    readTime: "6 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "GST calculation looks complicated at first. However, it follows two simple formulas that never change. Furthermore, once you understand the difference between GST-exclusive and GST-inclusive amounts, every calculation becomes straightforward." },
      { type: "p", text: "Whether you are a small business owner preparing an invoice, a freelancer charging a client, or a consumer checking a bill — understanding how to calculate GST accurately is essential. Moreover, even a small error in GST calculation can lead to compliance issues and penalties." },
      { type: "stat", num: "₹1,180", label: "Total invoice value on a ₹1,000 product at 18% GST — the most common calculation in India" },
      { type: "h2", text: "The Two GST Calculation Formulas You Need to Know" },
      { type: "p", text: "Every GST calculation in India falls into one of two categories. Specifically, you either need to <strong>add GST to a base price</strong> (GST-exclusive calculation) or <strong>remove GST from a total price</strong> (reverse GST calculation)." },
      { type: "h3", text: "Formula 1: Adding GST to a base amount (GST-exclusive)" },
      { type: "p", text: "Use this when you know the price <em>before</em> tax and want to find the final invoice amount. This is the most common scenario for businesses creating invoices." },
      { type: "formula", title: "GST-Exclusive Calculation", code: "GST Amount = (Original Cost × GST Rate) ÷ 100\nNet Price (incl. GST) = Original Cost + GST Amount\n\nExample — ₹1,000 product at 18% GST:\nGST Amount = (1,000 × 18) ÷ 100 = ₹180\nNet Price = ₹1,000 + ₹180 = ₹1,180\n\nCGST = ₹90 (9%) | SGST = ₹90 (9%) | IGST = ₹180 (interstate only)" },
      { type: "h3", text: "Formula 2: Removing GST from a total amount (reverse GST)" },
      { type: "p", text: "Use this when you have a GST-inclusive price and need to find the original base amount. Essential when reading an MRP tag or a vendor's invoice where GST is already embedded." },
      { type: "formula", title: "Reverse GST (GST-Inclusive) Calculation", code: "GST Amount = Total Price − [Total Price × 100 ÷ (100 + GST Rate)]\nOriginal Price = Total Price − GST Amount\n\nExample — ₹1,180 total at 18% GST:\nGST Amount = 1,180 − [1,180 × 100 ÷ 118] = ₹180\nOriginal Price = 1,180 − 180 = ₹1,000" },
      { type: "h2", text: "How to Calculate CGST, SGST and IGST Separately" },
      { type: "p", text: "When the transaction is <strong>intra-state</strong> — buyer and seller in the same state — the GST splits equally between CGST and SGST. An 18% GST becomes 9% CGST plus 9% SGST." },
      { type: "p", text: "Conversely, when the transaction is <strong>inter-state</strong> — buyer and seller in different states — only IGST applies at the full rate." },
      { type: "statGrid", items: [
        { n: "CGST 9%", l: "Intra-state — central share" },
        { n: "SGST 9%", l: "Intra-state — state share" },
        { n: "IGST 18%", l: "Inter-state — full rate" },
        { n: "= 18%", l: "Total GST — both routes" },
      ]},
      { type: "h2", text: "Worked Examples at Every GST Rate Slab" },
      { type: "p", text: "India currently has four primary GST rate slabs. The calculation method is identical for all four — only the rate number changes." },
      { type: "example", title: "Example 1 — 5% GST (packaged food, medicines)", lines: [
        "Base amount: ₹500 | GST at 5% = ₹25 | Invoice total = <strong>₹525</strong>",
        "CGST = ₹12.50 | SGST = ₹12.50 (intra-state)",
      ]},
      { type: "example", title: "Example 2 — 12% GST (processed food, mobile phones)", lines: [
        "Base amount: ₹2,000 | GST at 12% = ₹240 | Invoice total = <strong>₹2,240</strong>",
        "CGST = ₹120 | SGST = ₹120 (intra-state)",
      ]},
      { type: "example", title: "Example 3 — 18% GST (electronics, restaurants, services)", lines: [
        "Base amount: ₹10,000 | GST at 18% = ₹1,800 | Invoice total = <strong>₹11,800</strong>",
        "CGST = ₹900 | SGST = ₹900 (intra-state)",
      ]},
      { type: "example", title: "Example 4 — 28% GST (luxury goods, cement, cars)", lines: [
        "Base amount: ₹50,000 | GST at 28% = ₹14,000 | Invoice total = <strong>₹64,000</strong>",
        "CGST = ₹7,000 | SGST = ₹7,000 (intra-state)",
      ]},
      { type: "h2", text: "How to Calculate GST on a Service Invoice" },
      { type: "p", text: "Service providers — including freelancers, consultants, and agencies — charge GST at 18% on most services. The calculation works identically to goods. Apply 18% to the fee amount before tax, then add to arrive at the billable total." },
      { type: "p", text: "For instance, a web designer charging ₹50,000 for a project would add ₹9,000 GST (18%), resulting in a total invoice of ₹59,000. This invoice must show the GSTIN, place of supply, and the CGST/SGST breakdown if the client is in the same state." },
      { type: "h2", text: "Why Manual GST Calculation Is Error-Prone" },
      { type: "p", text: "Even experienced accountants make mistakes when calculating GST manually. The reverse GST formula — in particular — is frequently applied incorrectly, with many people simply subtracting the percentage rather than using the correct divisor." },
      { type: "p", text: "For example, removing 18% GST from ₹1,180 by calculating 18% of 1,180 (= ₹212.40) produces the wrong answer. The correct reverse calculation gives ₹180." },
      { type: "p", text: "For a full explanation of the different GST rate categories, see our guide on <a href=\"/blog/gst-rate-slabs-india\">GST rate slabs in India</a>. Additionally, if you need to understand how CGST and IGST differ in practice, read our detailed article on <a href=\"/blog/cgst-sgst-igst-difference\">CGST vs SGST vs IGST</a>." },
      { type: "cta", title: "Calculate GST instantly — free", text: "Enter any amount and select your GST rate. Get instant CGST, SGST, and IGST breakdowns — no sign-up required." },
    ],
  },
  {
    slug: "what-is-gst-india",
    title: "What Is GST? A Plain-English Guide for Indian Businesses",
    description:
      "What is GST? A clear, jargon-free explanation of India's Goods and Services Tax — how it works, why it replaced VAT, and what it means for businesses.",
    category: "Basics",
    readTime: "5 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "GST — Goods and Services Tax — is India's unified indirect tax on almost every product and service bought or sold in the country. It replaced a confusing web of 17 different central and state taxes when it launched on 1 July 2017." },
      { type: "p", text: "India's tax system before GST was, frankly, a mess. Businesses had to navigate VAT, service tax, excise duty, octroi, and several other levies — each with its own filing system, rate structure, and compliance requirement. GST's \"One Nation, One Tax\" framework was one of the most significant economic reforms in independent India's history." },
      { type: "stat", num: "1 July 2017", label: "Date GST replaced VAT, service tax, excise duty, and 14 other indirect taxes across India" },
      { type: "h2", text: "What Does GST Stand For — and What Does It Tax?" },
      { type: "p", text: "GST stands for <strong>Goods and Services Tax</strong>. It is a <strong>destination-based, multi-stage indirect tax</strong> — collected at every stage of the supply chain where value is added, and ultimately borne by the final consumer." },
      { type: "p", text: "GST applies to virtually all goods and services in India. However, certain items are exempt or zero-rated. Specifically, fresh fruits and vegetables, milk, eggs, and educational services attract zero GST. Electricity, petrol, diesel, alcohol, and real estate operate under separate state-level tax regimes." },
      { type: "h3", text: "What did GST replace?" },
      { type: "highlight", html: "<strong>Central taxes absorbed:</strong> Central Excise Duty, Service Tax, Central Sales Tax, Customs Additional Duties, Special Additional Duty of Customs.<br/><br/><strong>State taxes absorbed:</strong> VAT/Sales Tax, Entry Tax, Luxury Tax, Octroi, State Excise (on manufactured goods), Entertainment Tax, Advertisement Tax." },
      { type: "h2", text: "How GST Works — The Multi-Stage Tax Explained" },
      { type: "p", text: "GST is collected at every stage of the supply chain, from manufacturer to retailer to consumer. Businesses at each stage can claim a credit for the GST they already paid on their inputs — this is called <strong>Input Tax Credit (ITC)</strong>. The tax is effectively paid only on the <em>value added</em> at each stage." },
      { type: "example", title: "How multi-stage GST works — a simple chain", lines: [
        "<strong>Manufacturer</strong> sells goods worth ₹1,000 + 18% GST (₹180) to wholesaler. Pays ₹180 to government.",
        "<strong>Wholesaler</strong> adds ₹200 value, sells for ₹1,200 + 18% GST (₹216). Claims ₹180 ITC. Pays only ₹36 net.",
        "<strong>Retailer</strong> adds ₹300 value, sells for ₹1,500 + 18% GST (₹270). Claims ₹216 ITC. Pays only ₹54 net.",
        "<strong>Consumer</strong> pays ₹1,770 total. Total GST collected = ₹270 — only on final value.",
      ]},
      { type: "h2", text: "The Four Types of GST in India" },
      { type: "statGrid", items: [
        { n: "CGST", l: "Central GST — intra-state — collected by central govt" },
        { n: "SGST", l: "State GST — intra-state — collected by state govt" },
        { n: "IGST", l: "Integrated GST — inter-state — collected by centre" },
        { n: "UTGST", l: "Union Territory GST — for UTs without legislature" },
      ]},
      { type: "p", text: "For intra-state transactions, GST splits equally between CGST and SGST. An 18% GST becomes 9% CGST plus 9% SGST. For inter-state transactions, only IGST at the full rate applies." },
      { type: "h2", text: "Who Needs to Register for GST?" },
      { type: "p", text: "GST registration is mandatory once a business crosses the annual turnover threshold. Businesses with turnover above <strong>₹40 lakhs</strong> (for goods) or <strong>₹20 lakhs</strong> (for services) must register. Businesses in special category states have a lower threshold of ₹20 lakhs for goods and ₹10 lakhs for services." },
      { type: "p", text: "Certain businesses must register regardless of turnover: inter-state suppliers, e-commerce operators and their sellers, businesses under reverse charge mechanism, and anyone supplying through an e-commerce aggregator." },
      { type: "h3", text: "What is a GSTIN?" },
      { type: "p", text: "Upon registration, every business receives a <strong>GSTIN</strong> — Goods and Services Tax Identification Number. It is a 15-digit alphanumeric code: 2-digit state code + 10-digit PAN + 1-digit entity number + 1-digit check digit. The GSTIN must appear on every tax invoice." },
      { type: "h2", text: "GST Rate Slabs — The Quick Reference" },
      { type: "slabGrid", items: [
        { r: "0%", l: "Essentials — fresh food, milk, eggs, books" },
        { r: "5%", l: "Necessities — packaged food, medicines, transport" },
        { r: "12%", l: "Standard — processed food, mobile phones, textiles" },
        { r: "18%", l: "Most goods and services — electronics, restaurants" },
        { r: "28%", l: "Luxury and sin goods — cars, tobacco, cement" },
        { r: "3%", l: "Gold, silver, and precious metals" },
      ]},
      { type: "p", text: "For a complete breakdown of which products fall under each slab, read our detailed guide on <a href=\"/blog/gst-rate-slabs-india\">GST rate slabs in India 2024</a>. To understand how CGST and IGST differ in actual transactions, see our article on <a href=\"/blog/cgst-sgst-igst-difference\">CGST vs SGST vs IGST</a>." },
      { type: "quote", text: "GST is not merely a tax reform. It is an economic union of states. — Arun Jaitley, Finance Minister, at the GST launch ceremony, 30 June 2017" },
      { type: "cta", title: "Calculate your GST instantly", text: "Enter any amount — instant CGST, SGST, and IGST breakdown for all rate slabs. Free, no registration required." },
    ],
  },
  {
    slug: "gst-rate-slabs-india",
    title: "GST Rate Slabs in India 2024 — Which Rate Applies to You?",
    description:
      "Complete guide to GST rate slabs in India — 0%, 5%, 12%, 18%, 28% — with product examples, HSN codes, and how to find the right rate.",
    category: "Tax Rates",
    readTime: "6 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "India's GST framework places every product and service into one of six rate categories. Knowing which slab applies to your transaction is the single most important step in any GST calculation." },
      { type: "p", text: "This guide breaks down every GST rate slab with real-world product examples, so you can identify the correct rate quickly. It also explains how HSN and SAC codes connect products and services to their applicable rates." },
      { type: "h2", text: "The Six GST Rate Slabs in India — Overview" },
      { type: "p", text: "India's GST Council established six standard rate bands: 0%, 3%, 5%, 12%, 18%, and 28%. A small number of goods attract special rates of 0.25% (rough diamonds) and 1.5% (cut and polished diamonds). The majority of everyday goods and most services fall under the 5%, 12%, or 18% slabs." },
      { type: "slabGrid", items: [
        { r: "0%", l: "Essential goods — nil rated" },
        { r: "3%", l: "Gold, silver, precious stones" },
        { r: "5%", l: "Merit goods — necessities" },
        { r: "12%", l: "Standard goods — processed" },
        { r: "18%", l: "Most goods and services" },
        { r: "28%", l: "Luxury and demerit goods" },
      ]},
      { type: "h2", text: "0% GST — Zero-Rated and Exempt Goods" },
      { type: "p", text: "The 0% slab covers essential items that the government wants to keep affordable. There is an important distinction between <strong>zero-rated</strong> and <strong>exempt</strong> goods — one that matters significantly for input tax credit claims." },
      { type: "p", text: "Zero-rated supplies (like exports and supplies to SEZs) allow businesses to claim ITC on inputs even though output tax is zero. Exempt supplies do not attract GST and also do not qualify for ITC on inputs." },
      { type: "example", title: "Common 0% GST items", lines: [
        "Fresh fruits and vegetables, milk and dairy (unprocessed), eggs, meat and fish (unprocessed), cereals and pulses (unbranded), salt, water (non-bottled), fresh bread, books and newspapers, educational services, healthcare services.",
      ]},
      { type: "h2", text: "5% GST Slab — Merit Goods and Basic Necessities" },
      { type: "p", text: "The 5% slab covers goods and services that are widely used but not considered bare essentials. Many agricultural inputs fall here to support the farming sector." },
      { type: "example", title: "Common 5% GST items", lines: [
        "<strong>Food:</strong> Packaged and branded food items, edible oils, sugar, tea, coffee, frozen vegetables, fish (processed).",
        "<strong>Medicines:</strong> Life-saving drugs, basic medicines, vaccines.",
        "<strong>Services:</strong> Railways (AC class), economy class air travel, small restaurants (without AC).",
        "<strong>Other:</strong> Coal, fertilisers, agro machinery, renewable energy devices.",
      ]},
      { type: "h2", text: "12% GST Slab — Processed and Standard Goods" },
      { type: "p", text: "The 12% slab covers a wide range of processed goods and some services. Many manufactured goods that have been through significant processing fall here." },
      { type: "example", title: "Common 12% GST items", lines: [
        "<strong>Food:</strong> Ghee, butter, cheese, frozen meat products, fruit juices, namkeen and snacks.",
        "<strong>Electronics:</strong> Mobile phones (verify current rates — revised periodically).",
        "<strong>Textiles:</strong> Apparel above ₹1,000, readymade garments.",
        "<strong>Services:</strong> Work contracts for non-residential construction, business class air travel.",
      ]},
      { type: "h2", text: "18% GST Slab — The Most Common Rate" },
      { type: "p", text: "The 18% slab is the most widely applicable rate in India. The majority of manufactured goods, most professional services, and most consumer products fall here. It is the default rate for services where no specific rate is prescribed." },
      { type: "example", title: "Common 18% GST items", lines: [
        "<strong>Electronics:</strong> Computers, laptops, televisions, refrigerators, washing machines, air conditioners.",
        "<strong>Services:</strong> IT services, financial services, telecom, insurance, consulting, marketing, restaurants (with AC).",
        "<strong>Building materials:</strong> Cement, steel, paint, tiles, plywood.",
        "<strong>Other:</strong> FMCG products (shampoo, toothpaste, soap), packaged drinking water above 20 litres, cameras.",
      ]},
      { type: "h2", text: "28% GST Slab — Luxury and Demerit Goods" },
      { type: "p", text: "The 28% slab is reserved for luxury items and goods the government specifically wishes to discourage through taxation. Many items in this slab also attract an additional <strong>GST Cess</strong> on top of the 28% rate. The effective tax rate on premium cars and tobacco products can exceed 40%." },
      { type: "example", title: "Common 28% GST items", lines: [
        "<strong>Vehicles:</strong> Passenger cars (with additional cess of 1–22% depending on engine size and type).",
        "<strong>Tobacco:</strong> Cigarettes, cigars, pan masala, gutka (with additional cess).",
        "<strong>Luxury goods:</strong> Premium cosmetics (above a certain price), aircrafts for personal use.",
        "<strong>Construction:</strong> Premium residential construction projects in certain categories.",
      ]},
      { type: "h2", text: "How to Find the GST Rate for Any Product — HSN and SAC Codes" },
      { type: "p", text: "Every product in India has an <strong>HSN (Harmonised System of Nomenclature) code</strong> — an internationally recognised classification number. The GST rate for any product is determined by its HSN code, not its common name." },
      { type: "p", text: "Similarly, every service has a <strong>SAC (Services Accounting Code)</strong>. Businesses with turnover above ₹5 crore must include the full 8-digit HSN code on all invoices. Businesses below this threshold may use 4-digit codes." },
      { type: "h3", text: "Quick HSN code lookup method" },
      { type: "p", text: "The official GST portal at gstin.gov.in provides a comprehensive HSN code search tool. The CBIC website maintains the master GST rate schedule. Most GST accounting software packages include built-in HSN lookup functionality." },
      { type: "p", text: "For the calculation method at each of these slabs, see our step-by-step guide on <a href=\"/blog/how-to-calculate-gst\">how to calculate GST in India</a>. If you are unsure whether to use CGST/SGST or IGST, read our article on <a href=\"/blog/cgst-sgst-igst-difference\">CGST vs SGST vs IGST differences</a>." },
      { type: "cta", title: "Know your rate? Calculate GST instantly", text: "Enter your amount and select the applicable slab — instant CGST, SGST, and IGST breakdown for any rate." },
    ],
  },
  {
    slug: "cgst-sgst-igst-difference",
    title: "CGST vs SGST vs IGST — Differences and When Each Applies",
    description:
      "Understand the difference between CGST, SGST, and IGST — when each applies, how to split GST on invoices, and why getting it right matters for filing.",
    category: "Tax Types",
    readTime: "5 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "When you raise a GST invoice in India, one critical question determines how the tax splits: are the buyer and seller in the same state, or different states? This single answer determines whether you charge CGST plus SGST or a single IGST." },
      { type: "p", text: "This distinction confuses new GST registrants more than any other aspect of the tax. This guide explains each component clearly, with examples, so you never misclassify a transaction again." },
      { type: "h2", text: "What Is CGST — Central Goods and Services Tax?" },
      { type: "p", text: "<strong>CGST</strong> is the Central Goods and Services Tax — the portion of GST collected by the central government on transactions that happen within a single state. When a seller in Mumbai sells to a buyer also in Mumbai, CGST applies. The CGST rate is always exactly half of the total GST rate on the transaction." },
      { type: "formula", title: "CGST Calculation", code: "CGST Rate = Total GST Rate ÷ 2\nCGST Amount = Taxable Value × (CGST Rate ÷ 100)\n\nExample: ₹10,000 sale at 18% GST (intra-state)\nCGST = 10,000 × 9% = ₹900" },
      { type: "h2", text: "What Is SGST — State Goods and Services Tax?" },
      { type: "p", text: "<strong>SGST</strong> is the State Goods and Services Tax — collected by the state government on the same intra-state transactions. SGST always equals CGST exactly — both are half of the total GST rate. A single 18% GST transaction within one state generates ₹900 CGST and ₹900 SGST." },
      { type: "p", text: "SGST revenue stays entirely with the state where the transaction occurs. The SGST framework ensures that states benefit from consumption tax revenue generated within their borders." },
      { type: "h2", text: "What Is IGST — Integrated Goods and Services Tax?" },
      { type: "p", text: "<strong>IGST</strong> is the Integrated Goods and Services Tax — applied when goods or services move across state lines. IGST applies to inter-state supplies, imports, and exports. IGST is collected entirely by the central government, which subsequently distributes the state's share to the destination state." },
      { type: "formula", title: "IGST Calculation", code: "IGST Rate = Full GST Rate (no splitting)\nIGST Amount = Taxable Value × (IGST Rate ÷ 100)\n\nExample: ₹10,000 sale from Delhi to Chennai at 18% GST\nIGST = 10,000 × 18% = ₹1,800 (no CGST/SGST split)" },
      { type: "h2", text: "CGST + SGST vs IGST — Side-by-Side Comparison" },
      { type: "statGrid", items: [
        { n: "CGST + SGST", l: "Intra-state — buyer and seller same state" },
        { n: "IGST", l: "Inter-state — buyer and seller different states" },
        { n: "Equal split", l: "CGST = SGST = half of total GST rate" },
        { n: "Full rate", l: "IGST = total GST rate, no splitting" },
      ]},
      { type: "p", text: "Both approaches collect the same total GST amount from the buyer. From the buyer's perspective, the total invoice amount is identical whether CGST+SGST or IGST applies. However, the distinction matters for the seller's filing and ITC reconciliation." },
      { type: "h2", text: "What Is Place of Supply — and Why It Determines CGST vs IGST" },
      { type: "p", text: "The <strong>place of supply</strong> is the GST concept that determines which type of tax applies. If the place of supply is the same state as the supplier's registered state, CGST and SGST apply. If the place of supply is a different state, IGST applies." },
      { type: "p", text: "For goods, the place of supply is generally straightforward — it is where the goods are delivered. For services, the rules are more nuanced. The GST Act contains over 14 specific rules for determining the place of supply of services." },
      { type: "h3", text: "Common place-of-supply scenarios for services" },
      { type: "example", title: "Service — determining intra-state vs inter-state", lines: [
        "<strong>A Mumbai agency bills a Mumbai company:</strong> Place of supply = Maharashtra = same as supplier's state → CGST + SGST",
        "<strong>A Mumbai agency bills a Bengaluru company:</strong> Place of supply = Karnataka ≠ Maharashtra → IGST",
        "<strong>A Delhi consultant delivers an online course nationally:</strong> Place of supply = each student's location → mostly IGST for out-of-Delhi students",
      ]},
      { type: "h2", text: "What Is UTGST — and When Does It Apply?" },
      { type: "p", text: "<strong>UTGST</strong> is the Union Territory Goods and Services Tax. It applies instead of SGST in union territories that do not have their own legislature — namely Chandigarh, Dadra and Nagar Haveli, Daman and Diu, Lakshadweep, and Ladakh. Delhi and Puducherry have legislatures, so they levy SGST rather than UTGST." },
      { type: "h2", text: "ITC Implications — Why the CGST/IGST Split Matters for Businesses" },
      { type: "p", text: "Input Tax Credit (ITC) rules have specific provisions about how CGST, SGST, and IGST credits are used. IGST credit can be used to offset IGST, CGST, or SGST liability — in that order. CGST credit can only offset CGST and IGST, while SGST credit can only offset SGST and IGST." },
      { type: "p", text: "A business with significant IGST credit has more flexibility in offsetting various tax liabilities than one with only CGST credit. This means inter-state purchasing can sometimes provide ITC flexibility advantages." },
      { type: "p", text: "For a complete guide to calculating CGST and IGST amounts at each rate, see our article on <a href=\"/blog/how-to-calculate-gst\">how to calculate GST in India</a>. For a full breakdown of which rate applies to your product, read our guide on <a href=\"/blog/gst-rate-slabs-india\">GST rate slabs in India</a>." },
      { type: "cta", title: "Calculate CGST, SGST, and IGST instantly", text: "Enter your amount — automatic CGST/SGST and IGST breakdown for any GST rate slab. Free and instant." },
    ],
  },
  {
    slug: "gst-for-freelancers-india",
    title: "GST for Freelancers in India — What You Need to Know",
    description:
      "Everything Indian freelancers need to know about GST — registration threshold, how to charge 18% GST on invoices, file returns, and claim ITC on expenses.",
    category: "Freelancers",
    readTime: "6 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "If you are a freelancer in India earning from clients — whether domestic or international — GST likely applies to your work. Even freelancers who earn below the registration threshold need to understand the rules." },
      { type: "p", text: "This guide answers every practical question a freelancer has about GST in plain language. It covers the specific rules that apply to freelancers differently from regular businesses — particularly around international clients and export of services." },
      { type: "stat", num: "₹20 lakhs", label: "Annual turnover threshold above which most service-based freelancers must register for GST in India (₹10 lakhs in special category states)" },
      { type: "h2", text: "Do Freelancers Need to Register for GST?" },
      { type: "p", text: "The answer depends on two factors: your annual turnover and the nature of your clients. If your total billing from freelance work exceeds <strong>₹20 lakhs per year</strong>, GST registration is mandatory — regardless of whether your clients are in India or abroad. Freelancers in special category states have a lower threshold of ₹10 lakhs." },
      { type: "p", text: "There is an important exception. If <em>all</em> of your clients are outside India (i.e., you only do export of services), you may qualify for voluntary registration with a <strong>Letter of Undertaking (LUT)</strong> — which allows you to bill without collecting GST, even at lower turnovers." },
      { type: "h3", text: "When must you register regardless of turnover?" },
      { type: "p", text: "Certain situations trigger mandatory registration regardless of how much you earn: supplying services in more than one state, receiving payment from abroad even below the threshold in some interpretations, and providing services to clients who require a GSTIN for their own ITC claims. If you use any e-commerce platform to offer services, registration is mandatory from the first rupee earned." },
      { type: "h2", text: "What GST Rate Do Freelancers Charge?" },
      { type: "p", text: "Almost all freelance services in India attract <strong>18% GST</strong>. This includes web development, graphic design, content writing, photography, videography, consulting, marketing, social media management, and virtually every other professional or creative service." },
      { type: "formula", title: "Freelancer invoice — GST calculation", code: "Service fee: ₹50,000\nGST at 18%: ₹9,000 (CGST ₹4,500 + SGST ₹4,500 if same state)\nTotal invoice: ₹59,000\n\nIf client is in a different state:\nIGST at 18%: ₹9,000\nTotal invoice: ₹59,000 (same total, different tax line)" },
      { type: "h2", text: "GST on International Clients — Export of Services" },
      { type: "p", text: "If your client is outside India, your service qualifies as an <strong>export of services</strong> under GST law — provided the payment is received in foreign currency. Export of services is classified as <strong>zero-rated</strong> under GST. You do not charge GST to international clients, and you can additionally claim input tax credit on your business expenses." },
      { type: "p", text: "This zero-rating requires one of two formalities. You must either file a <strong>Letter of Undertaking (LUT)</strong> before raising the invoice — which allows you to export without paying IGST — or pay IGST and subsequently claim a refund. The LUT route is far simpler and is used by the vast majority of freelancers with international clients." },
      { type: "h3", text: "How to file an LUT for export services" },
      { type: "steps", items: [
        "Log in to the GST portal at gstin.gov.in with your GSTIN credentials.",
        "Navigate to Services → User Services → Furnish Letter of Undertaking.",
        "Select the financial year and fill in the LUT form. Provide bank and applicant details as required.",
        "Submit with DSC or EVC authentication. Keep the ARN (Acknowledgement Reference Number) for records.",
        "You can now raise zero-GST invoices to international clients for the full financial year.",
      ]},
      { type: "h2", text: "How to Create a GST-Compliant Invoice as a Freelancer" },
      { type: "p", text: "A valid GST invoice must include specific mandatory fields. Missing even one can invalidate the invoice for your client's ITC claim — damaging the relationship. If you are GST-registered, every invoice must include your GSTIN." },
      { type: "example", title: "Mandatory fields on a freelancer's GST invoice", lines: [
        "<strong>Your details:</strong> Full legal name, address, GSTIN, state code.",
        "<strong>Client details:</strong> Name, address, GSTIN (if GST-registered), place of supply.",
        "<strong>Invoice details:</strong> Unique invoice number, date, SAC code (for the service type).",
        "<strong>Amounts:</strong> Taxable value, GST rate, CGST + SGST or IGST amounts separately, total invoice value.",
        "<strong>Payment terms:</strong> Due date, bank details or payment link.",
      ]},
      { type: "h2", text: "Which GST Returns Must Freelancers File?" },
      { type: "p", text: "Once registered, freelancers must file GST returns regularly. The primary returns applicable to most freelancers are GSTR-1 and GSTR-3B. Missing filing deadlines triggers late fees and can result in the cancellation of GST registration." },
      { type: "p", text: "<strong>GSTR-1</strong> reports all outward supplies (your invoices) and must be filed monthly or quarterly depending on your turnover. <strong>GSTR-3B</strong> is a summary return filed monthly, reporting GST liability and ITC claims. Freelancers with turnover below ₹1.5 crore may opt for the quarterly filing scheme (QRMP)." },
      { type: "h2", text: "Input Tax Credit — What Freelancers Can Claim" },
      { type: "p", text: "One of the significant advantages of GST registration is the ability to claim Input Tax Credit on business expenses. Freelancers can claim ITC on: laptops and computers, software subscriptions (Adobe, Microsoft 365, etc.), internet connections, professional courses, coworking space memberships, and any other GST-paid business expenditure." },
      { type: "p", text: "Claiming ITC reduces your effective GST outgo. For instance, a freelancer paying ₹18,000 GST on a laptop purchase can offset this against future GST liability." },
      { type: "p", text: "For the exact formula to calculate 18% GST on your service invoices, use our <a href=\"/\">free GST calculator</a>. To understand whether your transactions qualify as intra-state or inter-state, read our guide on <a href=\"/blog/cgst-sgst-igst-difference\">CGST vs SGST vs IGST</a>. For a complete overview, see <a href=\"/blog/what-is-gst-india\">what is GST in India</a>." },
      { type: "cta", title: "Calculate your freelance GST invoice amount", text: "Enter your fee amount — instant 18% GST breakdown with CGST/SGST and IGST splits. Free, no registration required." },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
