// All the reading content for the site, in one place. General information for a school project.

export type Week = { week: number; trimester: 1 | 2 | 3; size: string; emoji: string; baby: string; mother: string };

const SIZES: Record<number, [string, string]> = {
  4: ["a poppy seed", "🌱"], 5: ["a sesame seed", "🌱"], 6: ["a lentil", "🌱"], 7: ["a blueberry", "🫐"],
  8: ["a raspberry", "🌱"], 9: ["a cherry", "🍒"], 10: ["a kumquat", "🍊"], 11: ["a fig", "🌱"],
  12: ["a lime", "🍋"], 13: ["a pea pod", "🫛"], 14: ["a lemon", "🍋"], 15: ["an apple", "🍎"],
  16: ["an avocado", "🥑"], 17: ["a pear", "🍐"], 18: ["a bell pepper", "🫑"], 19: ["a mango", "🥭"],
  20: ["a banana", "🍌"], 21: ["a carrot", "🥕"], 22: ["a papaya", "🌱"], 23: ["a grapefruit", "🍊"],
  24: ["an ear of corn", "🌽"], 25: ["a cauliflower", "🥦"], 26: ["a lettuce", "🥬"], 27: ["a cabbage", "🥬"],
  28: ["an aubergine", "🍆"], 29: ["a butternut squash", "🎃"], 30: ["a large cabbage", "🥬"], 31: ["a coconut", "🥥"],
  32: ["a squash", "🎃"], 33: ["a pineapple", "🍍"], 34: ["a cantaloupe melon", "🍈"], 35: ["a honeydew melon", "🍈"],
  36: ["a romaine lettuce", "🥬"], 37: ["a winter melon", "🍈"], 38: ["a pumpkin", "🎃"], 39: ["a small watermelon", "🍉"],
  40: ["a watermelon", "🍉"]
};

const BABY: Record<number, string> = {
  1: "Pregnancy is counted from the first day of your last period, so in weeks 1 and 2 you aren’t pregnant yet. Your body is getting ready to ovulate.",
  2: "Ovulation usually happens around the end of this week, when an egg is released and could be fertilised.",
  3: "Fertilisation happens and the fertilised egg begins dividing as it travels towards the womb.",
  4: "The tiny ball of cells settles into the lining of the womb.",
  5: "The neural tube, which becomes the brain and spinal cord, begins to form.",
  6: "A tiny heart begins to beat, and buds for arms and legs appear.",
  7: "The brain is growing quickly and facial features are starting to form.",
  8: "Fingers and toes begin to form, and the baby starts making small movements.",
  9: "Major organs are developing and the baby’s basic shape is set.",
  10: "Vital organs are formed and starting to work.",
  11: "Bones are beginning to harden and tooth buds have formed.",
  12: "Reflexes are developing, and the baby may open and close their fingers.",
  13: "Fingerprints are forming on tiny fingertips.",
  14: "The baby can squint, frown and make little faces.",
  15: "Bones are getting stronger and the baby may sense light.",
  16: "The eyes can make small movements and the heart is pumping strongly.",
  17: "Fat begins to form under the skin to help keep the baby warm.",
  18: "The baby can start to hear sounds.",
  19: "A protective coating called vernix covers the skin.",
  20: "Halfway there! Many parents have a detailed scan around now.",
  21: "You may start to feel kicks and movements more clearly.",
  22: "Senses like touch and taste are developing.",
  23: "The baby can hear louder sounds from outside the womb.",
  24: "The lungs are growing branches and starting to make a substance that helps breathing later.",
  25: "The baby is growing hair and may respond to your voice.",
  26: "The eyes begin to open.",
  27: "The brain is very active and sleep and wake patterns are forming.",
  28: "The third trimester begins. The baby can blink and has eyelashes.",
  29: "Muscles and lungs keep maturing, and kicks get stronger.",
  30: "The brain is growing fast and fat stores are increasing.",
  31: "The baby can turn their head from side to side.",
  32: "Fingernails and toenails have grown, and the baby practises breathing movements.",
  33: "Bones are hardening, though the skull stays soft for birth.",
  34: "The nervous system and lungs are maturing.",
  35: "There’s less room to move, but you should still feel regular movements.",
  36: "The baby is gaining weight quickly and may move head-down.",
  37: "The baby is now early term and practising for life outside the womb.",
  38: "Organs are ready to work on their own after birth.",
  39: "Full term. The baby is building fat to stay warm after birth.",
  40: "Your due date! Only a small number of babies arrive exactly on it."
};

const MOTHER = {
  1: "Early pregnancy can bring tiredness, nausea and tender breasts. Rest when you can and book your first antenatal appointment.",
  2: "Many people feel more energy in the second trimester. Your bump is growing and you may feel the first flutters.",
  3: "You may feel more tired and uncomfortable as baby grows. It’s a good time to pack your hospital bag and plan for the birth."
} as const;

export const WEEKS: Week[] = Array.from({ length: 40 }, (_, i) => {
  const week = i + 1;
  const trimester = (week < 14 ? 1 : week < 28 ? 2 : 3) as 1 | 2 | 3;
  const [size, emoji] = SIZES[week] ?? ["too small to measure yet", "🌱"];
  return { week, trimester, size, emoji, baby: BABY[week], mother: MOTHER[trimester] };
});

export const MILESTONES = [
  { age: "0–2 months", items: ["Recognises your voice", "Starts to smile at people", "Follows faces with their eyes"] },
  { age: "3–4 months", items: ["Holds head steady", "Laughs and coos", "Brings hands to mouth"] },
  { age: "5–6 months", items: ["Rolls over", "Sits with support", "Reaches for toys"] },
  { age: "7–9 months", items: ["Sits without support", "Babbles sounds like “mama”", "May start to crawl"] },
  { age: "10–12 months", items: ["Pulls up to stand", "Waves bye-bye", "May say a first word"] },
  { age: "12–18 months", items: ["Takes first steps", "Says several words", "Points to show you things"] }
];

export type Article = { slug: string; title: string; summary: string; body: string[] };

export const MOTHER_CARE: Article[] = [
  {
    slug: "rest-and-sleep",
    title: "Rest and sleep",
    summary: "Why rest matters and simple ways to get more of it.",
    body: [
      "Your body works hard during pregnancy and after birth. Short naps and early nights help your body recover and your mood stay steady.",
      "In later pregnancy, sleeping on your side with a pillow between your knees can feel more comfortable. After birth, try to rest when your baby sleeps."
    ]
  },
  {
    slug: "eating-well",
    title: "Eating well",
    summary: "Balanced meals and staying hydrated.",
    body: [
      "A balanced diet with fruit, vegetables, whole grains, protein and dairy gives you and your baby the energy you both need.",
      "Drink plenty of water through the day. Some foods are best avoided in pregnancy, so check the guidance where you live."
    ]
  },
  {
    slug: "staying-active",
    title: "Staying active",
    summary: "Gentle movement for body and mind.",
    body: [
      "Gentle activity like walking, swimming and stretching can boost energy, help sleep and lift your mood.",
      "Listen to your body and slow down if anything feels uncomfortable. Ask your care team before starting something new."
    ]
  },
  {
    slug: "emotional-wellbeing",
    title: "Emotional wellbeing",
    summary: "Your feelings matter too.",
    body: [
      "It’s normal to feel a mix of excitement, worry and tiredness. Talking to people you trust can make a big difference.",
      "Many people feel tearful a few days after birth (the “baby blues”). If low mood lasts more than two weeks, or you feel unable to cope, speak to a health professional."
    ]
  },
  {
    slug: "postpartum-recovery",
    title: "Recovering after birth",
    summary: "What to expect in the weeks after delivery.",
    body: [
      "Recovery takes time. Bleeding, soreness and tiredness are common in the first weeks.",
      "Accept help with meals and chores, keep up with your postnatal check, and contact your care team if something doesn’t feel right."
    ]
  },
  {
    slug: "feeding-support",
    title: "Feeding support for you",
    summary: "Looking after yourself while feeding your baby.",
    body: [
      "Whether you breastfeed, bottle feed or do both, feeding takes energy. Keep water and a snack nearby.",
      "If feeding is painful or difficult, ask a midwife, health visitor or feeding supporter for help early."
    ]
  }
];

export const NEWBORN_CARE: Article[] = [
  {
    slug: "feeding-cues",
    title: "Feeding cues",
    summary: "How to tell your baby is hungry.",
    body: [
      "Newborns usually feed little and often, around 8 to 12 times in 24 hours.",
      "Early hunger signs include stirring, rooting (turning towards your hand) and sucking on their hands. Crying is often a late sign."
    ]
  },
  {
    slug: "safe-sleep",
    title: "Safe sleep",
    summary: "Simple steps for safer sleep.",
    body: [
      "Place your baby on their back to sleep, in their own clear, flat sleep space, with no pillows, bumpers or loose blankets.",
      "Keep the room at a comfortable temperature and keep your baby smoke-free."
    ]
  },
  {
    slug: "bathing-and-nappies",
    title: "Bathing and nappy care",
    summary: "Keeping your baby clean and comfortable.",
    body: [
      "A few baths a week is plenty for a newborn. Use warm (not hot) water and never leave your baby alone in the bath.",
      "Change nappies often and let the skin dry to help prevent nappy rash."
    ]
  },
  {
    slug: "crying-and-soothing",
    title: "Crying and soothing",
    summary: "Ways to calm a crying baby.",
    body: [
      "All babies cry. Try feeding, a nappy change, gentle rocking, skin-to-skin contact or a calm, quiet room.",
      "If you feel overwhelmed, put your baby somewhere safe, take a few minutes to breathe, and ask someone for help."
    ]
  },
  {
    slug: "checks-and-vaccinations",
    title: "Checks and vaccinations",
    summary: "Routine checks in the first year.",
    body: [
      "Your baby will have routine health checks and vaccinations in their first year. Keep a record of dates in your appointments.",
      "Ask questions at each check. No question is too small."
    ]
  },
  {
    slug: "when-to-get-help",
    title: "When to get help",
    summary: "Signs that need a professional’s advice.",
    body: [
      "Get medical advice if your baby has a high temperature, isn’t feeding well, is unusually sleepy, or has fewer wet nappies.",
      "In an emergency, such as difficulty breathing, call your local emergency number straight away."
    ]
  }
];

export type BabyName = { name: string; gender: "girl" | "boy" | "any" };
const n = (gender: BabyName["gender"], list: string) => list.split(" ").map((name) => ({ name, gender }));
export const BABY_NAMES: BabyName[] = [
  ...n("girl", "Aanya Ananya Amara Amelia Aria Ava Chloe Diya Ella Emma Freya Grace Hana Ira Iris Isla Ivy Kavya Kiara Layla Leela Lily Maya Meera Mia Mila Nina Nora Olivia Riya Rosa Ruby Sana Sara Sofia Tara Zara Zoe"),
  ...n("boy", "Aarav Aditya Aiden Arjun Ayaan Dev Elijah Ethan Ezra Felix Henry Hugo Ishaan Jack Kabir Krish Leo Liam Luca Max Noah Oliver Omar Rohan Theo Ved Vihaan Yusuf"),
  ...n("any", "Alex Avery Charlie Eden Jordan Kai Ren Riley Rowan Sam Sky")
].sort((a, b) => a.name.localeCompare(b.name));

export const TOOLS = [
  { href: "/tools/due-date", title: "Due date & week tracker", text: "Estimate your due date and see how far along you are.", icon: "◷" },
  { href: "/tools/hospital-checklist", title: "Hospital bag checklist", text: "Pack for the big day and track your progress.", icon: "✓" },
  { href: "/tools/baby-names", title: "Baby name explorer", text: "Browse names, filter them and save your favourites.", icon: "✎" },
  { href: "/appointments", title: "Appointments", text: "Keep track of check-ups and scans (sign in needed).", icon: "▣" },
  { href: "/emergency", title: "Nearby hospitals", text: "Find hospitals, pharmacies, clinics and blood banks near you.", icon: "📍" },
  { href: "/emergency#kit", title: "Emergency kit", text: "SOS location sharing, emergency contacts, medical card and labour mode.", icon: "🆘" },
  { href: "/care", title: "Daily care", text: "Kick counter, vitamins, vaccines, baby log, growth chart and mood check-in.", icon: "🌤" }
];

// ---- Search ----
type SearchItem = { title: string; href: string; text: string; type: string };

const PAGES: SearchItem[] = [
  { title: "Pregnancy", href: "/pregnancy", text: "pregnancy trimesters weeks dashboard tracker", type: "Page" },
  { title: "Baby development", href: "/baby-development", text: "baby development week by week size milestones growth", type: "Page" },
  { title: "Mother care", href: "/mother-care", text: "maternal wellness rest sleep eating exercise emotional postpartum", type: "Page" },
  { title: "Baby care", href: "/newborn-care", text: "newborn care feeding sleep bathing nappies crying vaccinations", type: "Page" },
  { title: "Tools", href: "/tools", text: "tools due date checklist names appointments", type: "Page" },
  { title: "AI assistant", href: "/ai-assistant", text: "ask question chatbot ai assistant help", type: "Page" },
  { title: "Emergency help and nearby hospitals", href: "/emergency", text: "emergency urgent warning signs bleeding hospital map nearby help", type: "Page" },
  { title: "Community", href: "/community", text: "community forum mothers questions share", type: "Page" },
  { title: "Journal", href: "/journal", text: "journal diary notes feelings private", type: "Page" },
  { title: "About us", href: "/about", text: "about science fair project team", type: "Page" },
  { title: "Contact us", href: "/contact", text: "contact message feedback", type: "Page" }
];

export const SEARCH_INDEX: SearchItem[] = [
  ...PAGES,
  ...TOOLS.map((t) => ({ title: t.title, href: t.href, text: t.text, type: "Tool" })),
  ...WEEKS.map((w) => ({
    title: `Week ${w.week} of pregnancy`,
    href: `/pregnancy/week/${w.week}`,
    text: `week ${w.week} trimester ${w.trimester} size ${w.size} ${w.baby}`,
    type: "Pregnancy week"
  })),
  ...MOTHER_CARE.map((a) => ({ title: a.title, href: `/mother-care#${a.slug}`, text: `${a.summary} ${a.body.join(" ")}`, type: "Mother care" })),
  ...NEWBORN_CARE.map((a) => ({ title: a.title, href: `/newborn-care#${a.slug}`, text: `${a.summary} ${a.body.join(" ")}`, type: "Baby care" }))
];

export function search(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const weekMatch = q.match(/^(?:week\s*)?(\d{1,2})$/);
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  return SEARCH_INDEX.map((item) => {
    const title = item.title.toLowerCase();
    const text = item.text.toLowerCase();
    let score = 0;
    if (weekMatch && item.href === `/pregnancy/week/${Number(weekMatch[1])}`) score += 50;
    if (title.includes(q)) score += 10;
    for (const w of words) {
      if (title.includes(w)) score += 3;
      if (text.includes(w)) score += 1;
    }
    return { ...item, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}
