export type Stage = {
  number: string;
  title: string;
  description: string;
  icon: string;
  topics: string[];
  tips: string[];
};

export const stages: Stage[] = [
  {
    number: "01",
    title: "Pregnancy planning",
    description: "Prepare for the journey with clear, reliable preconception guidance.",
    icon: "♡",
    topics: ["Preconception health check", "Folic acid and nutrition", "Understanding your cycle", "Lifestyle and wellbeing"],
    tips: [
      "Book a preconception visit with your doctor or midwife.",
      "Ask a healthcare professional about folic acid before trying to conceive.",
      "Review any regular medicines with your doctor."
    ]
  },
  {
    number: "02",
    title: "Pregnancy care",
    description: "Understand each trimester, changing needs and important appointments.",
    icon: "✳",
    topics: ["Trimester-by-trimester changes", "Antenatal appointments and scans", "Eating well and staying active", "Common discomforts"],
    tips: [
      "Keep a list of questions for each antenatal appointment.",
      "Track your appointments and scan dates in one place.",
      "Know which symptoms mean you should call your care team."
    ]
  },
  {
    number: "03",
    title: "Birth preparation",
    description: "Feel more informed about labour, delivery and preparing for hospital.",
    icon: "⌂",
    topics: ["Signs of labour", "Writing a birth preference plan", "Pain relief options", "Packing your hospital bag"],
    tips: [
      "Pack your hospital bag a few weeks before your due date.",
      "Save your hospital and midwife phone numbers somewhere easy to find.",
      "Plan how you will get to the hospital, day or night."
    ]
  },
  {
    number: "04",
    title: "Postpartum recovery",
    description: "Support for physical recovery, feeding, rest and emotional wellbeing.",
    icon: "♡",
    topics: ["Physical recovery after birth", "Feeding support", "Rest and sleep", "Emotional wellbeing and baby blues"],
    tips: [
      "Accept help with meals, chores and visitors.",
      "Attend your postnatal check-up.",
      "Talk to someone if low mood lasts more than two weeks."
    ]
  },
  {
    number: "05",
    title: "Newborn care",
    description: "Learn about feeding, sleep, hygiene, development and when to seek help.",
    icon: "☼",
    topics: ["Feeding cues and routines", "Safe sleep basics", "Bathing and nappy care", "Vaccination schedule"],
    tips: [
      "Place your baby on their back to sleep, in their own sleep space.",
      "Keep a simple log of feeds and nappies in the early weeks.",
      "Keep your paediatrician's details close at hand."
    ]
  },
  {
    number: "06",
    title: "Growing together",
    description: "Explore milestones, nutrition and practical early-parenting guidance.",
    icon: "✿",
    topics: ["Developmental milestones", "Starting solid foods", "Play and bonding", "Routines for the whole family"],
    tips: [
      "Every child develops at their own pace. Ask your doctor if you're unsure.",
      "Make time for simple, everyday play.",
      "Share caregiving so everyone gets rest."
    ]
  }
];

export const features = [
  {
    title: "A guide for every stage",
    text: "Relevant, easy-to-understand information that follows a mother's journey.",
    icon: "⌁"
  },
  {
    title: "Ask without hesitation",
    text: "A welcoming place to explore everyday questions, big or small.",
    icon: "？"
  },
  {
    title: "Support for the whole family",
    text: "Helpful guidance for partners and loved ones who want to support the mother.",
    icon: "♡"
  }
];

export const checklistGroups = [
  {
    title: "For mother",
    items: ["Comfortable nightwear", "Maternity pads", "Nursing bra", "Toiletries and lip balm", "Phone charger", "Snacks and water bottle"]
  },
  {
    title: "For baby",
    items: ["Bodysuits and sleepsuits", "Newborn nappies", "Soft blanket", "Hat and socks", "Car seat for the journey home"]
  },
  {
    title: "Documents",
    items: ["ID and insurance details", "Antenatal records", "Birth preference plan", "Emergency contact list"]
  }
];

export const warningSigns = [
  "Heavy vaginal bleeding",
  "Severe headache, blurred vision or sudden swelling of the face or hands",
  "Chest pain or difficulty breathing",
  "Your baby moving less than usual",
  "Fever, or fluid leaking from the vagina before 37 weeks",
  "Thoughts of harming yourself or your baby"
];

export const suggestedQuestions = [
  "What should I pack in my hospital bag?",
  "How often should a newborn feed?",
  "What are the early signs of labour?",
  "How can my partner support me after birth?"
];

// Used when the NVIDIA API is unavailable (no key, no internet).
export const offlineAnswers = [
  {
    keywords: ["hospital", "bag", "pack", "packing"],
    answer: "A hospital bag usually includes comfortable clothes, toiletries, a phone charger and snacks, plus outfits, nappies and a car seat for the baby. Try the hospital bag checklist in the Tools section!"
  },
  {
    keywords: ["labour", "labor", "contraction", "contractions", "signs"],
    answer: "Common early signs of labour include regular, strengthening contractions, a 'show' (a mucus plug), back ache and the waters breaking. Contact your midwife or maternity unit if you think labour has started."
  },
  {
    keywords: ["feed", "feeding", "newborn", "milk", "breastfeed", "breastfeeding"],
    answer: "Newborns usually feed little and often, around 8 to 12 times in 24 hours. Watch for feeding cues like rooting, sucking on hands and stirring."
  },
  {
    keywords: ["partner", "dad", "father", "support", "help"],
    answer: "Partners can help by taking on meals and chores, handling visitors, doing night-time nappy changes and simply checking in on how the mother is feeling."
  },
  {
    keywords: ["sleep", "sleeping", "nap"],
    answer: "Newborns sleep a lot, often 14 to 17 hours a day in short stretches. Safe sleep means on their back, in their own clear sleep space."
  },
  {
    keywords: ["eat", "food", "diet", "nutrition", "eating"],
    answer: "A balanced diet with fruit, vegetables, whole grains, protein and plenty of water is a great base during pregnancy. Some foods are best avoided, so check the guidance in your country."
  }
];
