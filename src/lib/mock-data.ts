import type { Lang } from "./i18n";

export type Section = "politics" | "economy" | "sports" | "tech" | "culture" | "world";

export interface Article {
  id: string;
  slug: string;
  section: Section;
  image: string;
  publishedAt: string;
  readTime: number;
  author: { name: Record<Lang, string>; avatar: string };
  title: Record<Lang, string>;
  excerpt: Record<Lang, string>;
  body: Record<Lang, string[]>;
  tags: Record<Lang, string[]>;
}

const img = (seed: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const sections: Record<Section, Record<Lang, string>> = {
  politics: { en: "Politics", ar: "سياسة", fr: "Politique" },
  economy: { en: "Economy", ar: "اقتصاد", fr: "Économie" },
  sports: { en: "Sports", ar: "رياضة", fr: "Sports" },
  tech: { en: "Technology", ar: "تكنولوجيا", fr: "Technologie" },
  culture: { en: "Culture", ar: "ثقافة", fr: "Culture" },
  world: { en: "World", ar: "العالم", fr: "Monde" },
};

export const articles: Article[] = [
  {
    id: "1",
    slug: "central-banks-coordinated-policy-shift",
    section: "economy",
    image: img("1526304640581-d334cdbbf45e"),
    publishedAt: "2026-04-30T08:30:00Z",
    readTime: 5,
    author: {
      name: { en: "Tariq Mansour", ar: "طارق منصور", fr: "Tariq Mansour" },
      avatar: "https://i.pravatar.cc/120?img=68",
    },
    title: {
      en: "Central Banks Announce Coordinated Policy Shift to Stabilize Inflation",
      ar: "البنوك المركزية تعلن عن سياسات نقدية جديدة لضبط التضخم",
      fr: "Les banques centrales annoncent un changement de politique coordonné",
    },
    excerpt: {
      en: "In a rare synchronized move, the Federal Reserve, ECB and Bank of England unveiled a joint framework to anchor inflation expectations and steady volatile bond markets.",
      ar: "في خطوة متزامنة نادرة، كشف الاحتياطي الفيدرالي والبنك المركزي الأوروبي وبنك إنجلترا عن إطار مشترك لتثبيت توقعات التضخم وضبط أسواق السندات المتقلبة.",
      fr: "Dans un geste synchronisé inédit, la Fed, la BCE et la Banque d'Angleterre dévoilent un cadre commun pour ancrer les anticipations d'inflation.",
    },
    body: {
      en: [
        "WASHINGTON — In a rare display of monetary coordination, the world's three largest central banks unveiled a joint policy framework Wednesday aimed at anchoring inflation expectations and calming bond markets that have whipsawed traders for six consecutive weeks.",
        "The framework commits the Federal Reserve, the European Central Bank and the Bank of England to a shared communication calendar, synchronized liquidity facilities, and a quarterly review of cross-border financial conditions.",
        "\"Stability is a public good,\" Fed Chair Jerome Powell told reporters. \"When the largest economies pull in the same direction, transmission is faster and credibility is higher.\"",
      ],
      ar: [
        "واشنطن — في عرض نادر للتنسيق النقدي، كشفت أكبر ثلاثة بنوك مركزية في العالم يوم الأربعاء عن إطار سياسي مشترك يهدف إلى تثبيت توقعات التضخم وتهدئة أسواق السندات التي شهدت تقلبات حادة على مدى ستة أسابيع متتالية.",
        "يلتزم الإطار الذي يضم الاحتياطي الفيدرالي والبنك المركزي الأوروبي وبنك إنجلترا بتقويم تواصلي مشترك، وتسهيلات سيولة متزامنة، ومراجعة فصلية للأوضاع المالية العابرة للحدود.",
        "وقال رئيس الاحتياطي الفيدرالي جيروم باول للصحفيين: «الاستقرار منفعة عامة، وحين تسير الاقتصادات الكبرى في الاتجاه ذاته يصبح الانتقال أسرع والمصداقية أعلى».",
      ],
      fr: [
        "WASHINGTON — Dans une démonstration rare de coordination monétaire, les trois plus grandes banques centrales du monde ont dévoilé mercredi un cadre commun visant à ancrer les anticipations d'inflation et à apaiser des marchés obligataires secoués depuis six semaines.",
        "Le cadre engage la Fed, la BCE et la Banque d'Angleterre à un calendrier de communication partagé, à des facilités de liquidité synchronisées et à une revue trimestrielle des conditions financières transfrontalières.",
        "« La stabilité est un bien public », a déclaré le président de la Fed, Jerome Powell. « Quand les grandes économies vont dans le même sens, la transmission est plus rapide et la crédibilité plus forte. »",
      ],
    },
    tags: {
      en: ["Inflation", "Federal Reserve", "ECB", "Markets"],
      ar: ["تضخم", "الاحتياطي الفيدرالي", "البنك المركزي الأوروبي", "أسواق"],
      fr: ["Inflation", "Fed", "BCE", "Marchés"],
    },
  },
  {
    id: "2",
    slug: "markets-rally-tech",
    section: "economy",
    image: img("1611974789855-9c2a0a7236a3"),
    publishedAt: "2026-04-30T06:15:00Z",
    readTime: 4,
    author: {
      name: { en: "James Okafor", ar: "جيمس أوكافور", fr: "James Okafor" },
      avatar: "https://i.pravatar.cc/120?img=12",
    },
    title: {
      en: "Tech stocks surge as AI infrastructure spending hits record",
      ar: "أسهم التكنولوجيا تقفز مع بلوغ الإنفاق على البنية التحتية للذكاء الاصطناعي رقماً قياسياً",
      fr: "Les valeurs tech bondissent : l'investissement IA atteint un record",
    },
    excerpt: {
      en: "Capital expenditure on AI data centers reached $412 billion in Q1, lifting indices across three continents.",
      ar: "بلغ الإنفاق الرأسمالي على مراكز بيانات الذكاء الاصطناعي 412 مليار دولار في الربع الأول، رافعاً المؤشرات في ثلاث قارات.",
      fr: "Les dépenses pour les centres de données IA ont atteint 412 milliards de dollars au T1.",
    },
    body: {
      en: ["Markets opened sharply higher across Asia, Europe, and the Americas as quarterly capex disclosures from hyperscalers exceeded analyst projections by twenty-three percent."],
      ar: ["افتُتحت الأسواق على ارتفاع حاد في آسيا وأوروبا والأمريكتين بعد أن تجاوزت إفصاحات الإنفاق الرأسمالي للشركات العملاقة توقعات المحللين بنسبة ثلاثة وعشرين بالمئة."],
      fr: ["Les marchés ont ouvert en forte hausse alors que les capex trimestriels des hyperscalers ont dépassé les projections de vingt-trois pour cent."],
    },
    tags: {
      en: ["Markets", "AI", "Stocks"],
      ar: ["أسواق", "ذكاء اصطناعي", "أسهم"],
      fr: ["Marchés", "IA", "Actions"],
    },
  },
  {
    id: "3",
    slug: "champions-final-preview",
    section: "sports",
    image: img("1551958219-acbc608c6377"),
    publishedAt: "2026-04-29T22:00:00Z",
    readTime: 5,
    author: {
      name: { en: "Maria Costa", ar: "ماريا كوستا", fr: "Maria Costa" },
      avatar: "https://i.pravatar.cc/120?img=32",
    },
    title: {
      en: "Champions League final set for historic Istanbul rematch",
      ar: "نهائي دوري الأبطال على موعد مع إعادة تاريخية في إسطنبول",
      fr: "Finale de la Ligue des champions : revanche historique à Istanbul",
    },
    excerpt: {
      en: "A repeat of the 2005 classic awaits, with both squads boasting their strongest lineups in a decade.",
      ar: "إعادة لكلاسيكية 2005 في الانتظار، إذ يعتمد الفريقان على أقوى تشكيلتين خلال عقد.",
      fr: "Une rediffusion du classique de 2005 attend les fans, avec les meilleures formations depuis dix ans.",
    },
    body: { en: ["Full preview ahead of kickoff."], ar: ["معاينة كاملة قبل صافرة البداية."], fr: ["Aperçu complet avant le coup d'envoi."] },
    tags: { en: ["Football", "UCL"], ar: ["كرة قدم", "دوري الأبطال"], fr: ["Football", "LDC"] },
  },
  {
    id: "4",
    slug: "ai-chip-breakthrough",
    section: "tech",
    image: img("1518770660439-4636190af475"),
    publishedAt: "2026-04-29T18:45:00Z",
    readTime: 6,
    author: {
      name: { en: "Aisha Khan", ar: "عائشة خان", fr: "Aisha Khan" },
      avatar: "https://i.pravatar.cc/120?img=45",
    },
    title: {
      en: "Photonic chip breakthrough promises tenfold AI efficiency",
      ar: "اختراق في الرقائق الضوئية يَعِد بكفاءة عشرة أضعاف للذكاء الاصطناعي",
      fr: "Percée des puces photoniques : efficacité IA décuplée",
    },
    excerpt: {
      en: "Researchers demonstrate light-based processors operating at room temperature with unprecedented throughput.",
      ar: "باحثون يُظهرون معالجات ضوئية تعمل في درجة حرارة الغرفة بإنتاجية غير مسبوقة.",
      fr: "Des chercheurs présentent des processeurs lumineux à température ambiante.",
    },
    body: { en: ["Detailed technical analysis."], ar: ["تحليل تقني مفصّل."], fr: ["Analyse technique détaillée."] },
    tags: { en: ["AI", "Hardware"], ar: ["ذكاء اصطناعي", "عتاد"], fr: ["IA", "Matériel"] },
  },
  {
    id: "5",
    slug: "biennale-opens",
    section: "culture",
    image: img("1513475382585-d06e58bcb0e0"),
    publishedAt: "2026-04-29T14:00:00Z",
    readTime: 5,
    author: {
      name: { en: "Léa Dubois", ar: "ليا دوبوا", fr: "Léa Dubois" },
      avatar: "https://i.pravatar.cc/120?img=20",
    },
    title: {
      en: "Venice Biennale opens with focus on displacement and memory",
      ar: "بينالي البندقية يفتتح بتركيز على النزوح والذاكرة",
      fr: "La Biennale de Venise s'ouvre sur le déplacement et la mémoire",
    },
    excerpt: {
      en: "Eighty-eight national pavilions explore identity through installation, performance, and immersive video.",
      ar: "ثمانية وثمانون جناحاً وطنياً تستكشف الهوية عبر التركيب والأداء والفيديو الغامر.",
      fr: "Quatre-vingt-huit pavillons nationaux explorent l'identité.",
    },
    body: { en: ["Coverage from the opening week."], ar: ["تغطية من أسبوع الافتتاح."], fr: ["Reportage de la semaine d'ouverture."] },
    tags: { en: ["Art", "Venice"], ar: ["فن", "البندقية"], fr: ["Art", "Venise"] },
  },
  {
    id: "6",
    slug: "election-results-uk",
    section: "politics",
    image: img("1529107386315-e1a2ed48a620"),
    publishedAt: "2026-04-29T10:30:00Z",
    readTime: 8,
    author: {
      name: { en: "Tom Reed", ar: "توم ريد", fr: "Tom Reed" },
      avatar: "https://i.pravatar.cc/120?img=15",
    },
    title: {
      en: "Coalition talks intensify as parliament fragments after vote",
      ar: "محادثات الائتلاف تتصاعد مع تشظّي البرلمان بعد التصويت",
      fr: "Les pourparlers de coalition s'intensifient après un parlement fragmenté",
    },
    excerpt: {
      en: "No single party secured a majority, leaving four leaders to negotiate a working government.",
      ar: "لم يحقق أي حزب الأغلبية، مما يضع أربعة قادة أمام مهمة التفاوض على حكومة عاملة.",
      fr: "Aucun parti n'a obtenu la majorité, laissant quatre chefs négocier.",
    },
    body: { en: ["Live analysis from Westminster."], ar: ["تحليل مباشر من وستمنستر."], fr: ["Analyse en direct depuis Westminster."] },
    tags: { en: ["Election", "Parliament"], ar: ["انتخابات", "برلمان"], fr: ["Élection", "Parlement"] },
  },
  {
    id: "7",
    slug: "deep-sea-discovery",
    section: "tech",
    image: img("1507525428034-b723cf961d3e"),
    publishedAt: "2026-04-28T20:00:00Z",
    readTime: 6,
    author: {
      name: { en: "Hiro Tanaka", ar: "هيرو تاناكا", fr: "Hiro Tanaka" },
      avatar: "https://i.pravatar.cc/120?img=33",
    },
    title: {
      en: "Submersible discovers vast hydrothermal field in Pacific",
      ar: "غواصة تكتشف حقلاً حرارياً مائياً شاسعاً في المحيط الهادئ",
      fr: "Un submersible découvre un vaste champ hydrothermal dans le Pacifique",
    },
    excerpt: {
      en: "Mapping reveals a thermal vent system the size of a small city, hosting unknown species.",
      ar: "تكشف الخرائط عن نظام فتحات حرارية بحجم مدينة صغيرة يضم أنواعاً غير معروفة.",
      fr: "Un système de cheminées hydrothermales de la taille d'une petite ville.",
    },
    body: { en: ["Expedition log and species catalog."], ar: ["سجل البعثة وفهرس الأنواع."], fr: ["Journal d'expédition."] },
    tags: { en: ["Ocean", "Discovery"], ar: ["محيط", "اكتشاف"], fr: ["Océan", "Découverte"] },
  },
  {
    id: "8",
    slug: "oil-prices-shift",
    section: "economy",
    image: img("1473341304170-971dccb5ac1e"),
    publishedAt: "2026-04-28T16:00:00Z",
    readTime: 4,
    author: {
      name: { en: "Noor Al-Sayed", ar: "نور السيد", fr: "Noor Al-Sayed" },
      avatar: "https://i.pravatar.cc/120?img=49",
    },
    title: {
      en: "OPEC+ signals output cut as demand outlook softens",
      ar: "أوبك+ تلوّح بخفض الإنتاج مع تباطؤ توقعات الطلب",
      fr: "L'OPEP+ envisage une baisse de production",
    },
    excerpt: {
      en: "Ministers meet next week in Vienna as benchmark crude trades sideways.",
      ar: "الوزراء يجتمعون الأسبوع المقبل في فيينا فيما يتداول الخام المرجعي بشكل عرضي.",
      fr: "Les ministres se réunissent la semaine prochaine à Vienne.",
    },
    body: { en: ["Market commentary."], ar: ["تعليق السوق."], fr: ["Commentaire de marché."] },
    tags: { en: ["Oil", "OPEC"], ar: ["نفط", "أوبك"], fr: ["Pétrole", "OPEP"] },
  },
];

export const liveUpdates = [
  {
    id: "u1",
    timestamp: "2026-04-30T09:42:00Z",
    title: { en: "Foreign ministers issue joint statement", ar: "وزراء الخارجية يصدرون بياناً مشتركاً", fr: "Les ministres publient une déclaration commune" },
    body: { en: "The G7 has condemned the escalation and called for an immediate ceasefire.", ar: "أدانت مجموعة السبع التصعيد ودعت إلى وقف فوري لإطلاق النار.", fr: "Le G7 a condamné l'escalade et appelé à un cessez-le-feu immédiat." },
  },
  {
    id: "u2",
    timestamp: "2026-04-30T09:18:00Z",
    title: { en: "Aid convoy reaches northern corridor", ar: "قافلة مساعدات تصل إلى الممر الشمالي", fr: "Un convoi d'aide atteint le corridor nord" },
    body: { en: "Twenty-two trucks delivered medical supplies after a six-hour delay at the checkpoint.", ar: "اثنتان وعشرون شاحنة سلّمت إمدادات طبية بعد تأخير ست ساعات عند نقطة التفتيش.", fr: "Vingt-deux camions ont livré du matériel médical." },
    media: img("1469571486292-0ba58a3f068b", 800, 500),
  },
  {
    id: "u3",
    timestamp: "2026-04-30T08:55:00Z",
    title: { en: "President to address nation at noon", ar: "الرئيس يخاطب الأمة عند الظهر", fr: "Le président s'adressera à la nation à midi" },
    body: { en: "The address will be carried live on all major networks.", ar: "سيُبث الخطاب مباشرة على جميع الشبكات الرئيسية.", fr: "Le discours sera diffusé en direct." },
  },
  {
    id: "u4",
    timestamp: "2026-04-30T08:20:00Z",
    title: { en: "Markets open lower on geopolitical tension", ar: "الأسواق تفتح منخفضة بسبب التوتر الجيوسياسي", fr: "Les marchés ouvrent en baisse" },
    body: { en: "European indices opened down between 0.8% and 1.4%.", ar: "افتُتحت المؤشرات الأوروبية على انخفاض بين 0.8% و1.4%.", fr: "Les indices européens ont ouvert en baisse entre 0,8 % et 1,4 %." },
  },
  {
    id: "u5",
    timestamp: "2026-04-30T07:40:00Z",
    title: { en: "Initial reports of overnight developments", ar: "تقارير أولية عن تطورات ليلية", fr: "Premiers rapports sur les développements de la nuit" },
    body: { en: "Witnesses describe heavy activity along the eastern border throughout the night.", ar: "شهود يصفون نشاطاً مكثفاً على طول الحدود الشرقية طوال الليل.", fr: "Des témoins décrivent une activité intense." },
  },
];
