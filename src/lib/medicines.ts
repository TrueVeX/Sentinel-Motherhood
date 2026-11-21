// A plain-language guide to medicines and supplements commonly prescribed in pregnancy, after
// birth and for newborns. General information only: what each is commonly used for, and safety
// notes. It deliberately gives NO doses. Always follow the doctor's prescription.

export type MedicineFor = "mother" | "baby" | "both";
export type MedicineInfo = {
  name: string;
  for: MedicineFor;
  aka?: string[]; // other names and common brands/forms, used for matching
  group: "Supplement" | "Pain & fever" | "Tummy" | "Blood pressure" | "Diabetes" | "Pregnancy support" | "Given in hospital" | "Vaccine" | "Newborn" | "Baby & child";
  usedFor: string;
  notes: string;
};

export const MEDICINE_GUIDE: MedicineInfo[] = [
  {
    name: "Folic acid",
    for: "mother",
    aka: ["folate", "folvite", "vitamin b9"],
    group: "Supplement",
    usedFor: "Helps the baby’s brain and spine develop properly and lowers the risk of neural tube defects (such as spina bifida). Usually started before pregnancy and taken in the first months.",
    notes: "Taken daily as prescribed. A higher dose is sometimes prescribed for women at higher risk."
  },
  {
    name: "Iron",
    for: "mother",
    aka: ["ifa", "iron folic acid", "ferrous sulphate", "ferrous sulfate", "ferrous fumarate", "ferrous ascorbate", "iron sucrose"],
    group: "Supplement",
    usedFor: "Prevents and treats anaemia (low haemoglobin), which is common in pregnancy and can cause tiredness and breathlessness.",
    notes: "Can cause dark stools, constipation or an upset stomach. Tea, coffee, milk and calcium tablets reduce how much iron is absorbed, so doctors often advise taking them at different times. Sometimes given as a drip (iron sucrose) for severe anaemia."
  },
  {
    name: "Calcium",
    for: "mother",
    aka: ["calcium carbonate", "calcium citrate", "shelcal", "calcium + vitamin d3"],
    group: "Supplement",
    usedFor: "Supports the mother’s bones and the baby’s bone growth. In women whose diet is low in calcium, it also helps lower the risk of pre-eclampsia (high blood pressure in pregnancy).",
    notes: "Usually not taken at the same time as iron tablets, as each reduces the other’s absorption."
  },
  {
    name: "Vitamin D",
    for: "mother",
    aka: ["vitamin d3", "cholecalciferol"],
    group: "Supplement",
    usedFor: "Helps the body absorb calcium for healthy bones in mother and baby. Often prescribed when blood levels are low or sunlight is limited.",
    notes: "Taken as prescribed: some forms are daily, others weekly or monthly."
  },
  {
    name: "Omega-3 / DHA",
    for: "mother",
    aka: ["dha", "fish oil", "omega 3"],
    group: "Supplement",
    usedFor: "Supports the development of the baby’s brain and eyes.",
    notes: "Some prescriptions combine DHA with other vitamins."
  },
  {
    name: "Paracetamol",
    for: "both",
    aka: ["acetaminophen", "crocin", "dolo", "calpol"],
    group: "Pain & fever",
    usedFor: "Relieves pain (such as headache) and lowers fever. It is the pain reliever most commonly advised during pregnancy and breastfeeding.",
    notes: "Use only as advised by your doctor, for the shortest time needed. A fever or headache in pregnancy can need checking, so tell your doctor."
  },
  {
    name: "Ibuprofen",
    for: "mother",
    aka: ["brufen", "advil", "nsaid"],
    group: "Pain & fever",
    usedFor: "Relieves pain and swelling. Often prescribed after birth.",
    notes: "Usually avoided during pregnancy, especially after 20 weeks, unless a doctor specifically prescribes it. Commonly considered acceptable while breastfeeding when prescribed."
  },
  {
    name: "Doxylamine–pyridoxine",
    for: "mother",
    aka: ["doxinate", "doxylamine", "pyridoxine", "vitamin b6", "diclegis"],
    group: "Tummy",
    usedFor: "Eases nausea and vomiting of pregnancy (morning sickness).",
    notes: "Can cause drowsiness. Severe vomiting or being unable to keep fluids down needs medical care."
  },
  {
    name: "Ondansetron",
    for: "mother",
    aka: ["emeset", "zofran"],
    group: "Tummy",
    usedFor: "Treats severe nausea and vomiting when other treatments haven’t helped.",
    notes: "Prescribed by a doctor after weighing up benefits and risks."
  },
  {
    name: "Antacid",
    for: "mother",
    aka: ["gelusil", "digene", "magnesium hydroxide", "aluminium hydroxide", "alginate", "gaviscon"],
    group: "Tummy",
    usedFor: "Relieves heartburn and acidity, which are common in later pregnancy.",
    notes: "Antacids can stop iron being absorbed, so they are usually taken at a different time."
  },
  {
    name: "Lactulose",
    for: "mother",
    aka: ["duphalac", "isabgol", "psyllium", "laxative"],
    group: "Tummy",
    usedFor: "Softens stools and relieves constipation, which is common in pregnancy and after birth (and with iron tablets).",
    notes: "Drinking water and eating fibre also help."
  },
  {
    name: "Oral rehydration salts (ORS)",
    for: "both",
    aka: ["ors", "electral"],
    group: "Tummy",
    usedFor: "Replaces water and salts lost through diarrhoea or vomiting, to prevent dehydration, for mothers and for babies and children.",
    notes: "Mixed exactly as the packet says. Get help if diarrhoea or vomiting is severe or doesn’t stop."
  },
  {
    name: "Low-dose aspirin",
    for: "mother",
    aka: ["aspirin", "ecosprin", "loprin"],
    group: "Pregnancy support",
    usedFor: "Prescribed to women at higher risk of pre-eclampsia, to lower that risk. Usually started early in pregnancy.",
    notes: "Only take it if your doctor has prescribed it for this reason, and follow when they say to stop."
  },
  {
    name: "Progesterone",
    for: "mother",
    aka: ["susten", "duphaston", "dydrogesterone", "utrogestan"],
    group: "Pregnancy support",
    usedFor: "Supports the pregnancy in some situations, such as a history of preterm birth, a short cervix, or after fertility treatment.",
    notes: "Can be tablets, pessaries or injections. Don’t stop suddenly without your doctor’s advice."
  },
  {
    name: "Labetalol",
    for: "mother",
    aka: ["labetol"],
    group: "Blood pressure",
    usedFor: "Lowers high blood pressure in pregnancy.",
    notes: "Blood pressure needs regular checks while taking it. Headache, blurred vision or swelling are warning signs to report straight away."
  },
  {
    name: "Nifedipine",
    for: "mother",
    aka: ["calcigard", "depin"],
    group: "Blood pressure",
    usedFor: "Lowers high blood pressure in pregnancy. Sometimes also used to slow early (preterm) contractions.",
    notes: "Can cause headache or flushing. Report severe headache or vision changes."
  },
  {
    name: "Methyldopa",
    for: "mother",
    aka: ["alphadopa", "aldomet"],
    group: "Blood pressure",
    usedFor: "Lowers high blood pressure in pregnancy.",
    notes: "Can cause tiredness. Regular blood pressure checks are needed."
  },
  {
    name: "Insulin",
    for: "mother",
    aka: ["humulin", "mixtard", "novorapid"],
    group: "Diabetes",
    usedFor: "Controls blood sugar in diabetes during pregnancy (including gestational diabetes) when diet and exercise aren’t enough.",
    notes: "Check sugar levels as advised. Learn the signs of low sugar (shakiness, sweating, confusion) and what to do."
  },
  {
    name: "Metformin",
    for: "mother",
    aka: ["glycomet", "glucophage"],
    group: "Diabetes",
    usedFor: "Helps control blood sugar in gestational diabetes or type 2 diabetes; sometimes used in PCOS.",
    notes: "Can upset the stomach at first. Your doctor decides whether it is right for you in pregnancy."
  },
  {
    name: "Albendazole",
    for: "both",
    aka: ["zentel", "deworming"],
    group: "Supplement",
    usedFor: "Treats worm infections, which can cause anaemia. In India it is given to pregnant women as a single dose after the first trimester, and to children from 1 year old on National Deworming Days.",
    notes: "Not given in the first three months of pregnancy. Children’s doses depend on age, as the health worker or doctor advises."
  },
  {
    name: "Tetanus–diphtheria vaccine (Td)",
    for: "mother",
    aka: ["td", "tt", "tetanus"],
    group: "Vaccine",
    usedFor: "Protects mother and newborn from tetanus (and the mother from diphtheria).",
    notes: "Given as injections during pregnancy on the schedule your clinic follows."
  },
  {
    name: "Anti-D immunoglobulin",
    for: "mother",
    aka: ["anti d", "rhogam", "rh immunoglobulin"],
    group: "Given in hospital",
    usedFor: "For Rh-negative mothers: stops the body making antibodies that could harm a future Rh-positive baby.",
    notes: "Given as an injection during pregnancy and/or after birth, or after bleeding. Know your blood group."
  },
  {
    name: "Oxytocin",
    for: "mother",
    aka: ["pitocin", "syntocinon"],
    group: "Given in hospital",
    usedFor: "Given in hospital to start or strengthen labour contractions, and after birth to help the womb contract and prevent heavy bleeding.",
    notes: "Only given by healthcare staff, with monitoring."
  },
  {
    name: "Iron and calcium after birth",
    for: "mother",
    aka: ["postnatal iron", "postnatal calcium"],
    group: "Supplement",
    usedFor: "Often continued for some months after birth to rebuild iron and calcium, especially while breastfeeding.",
    notes: "Your doctor tells you how long to continue."
  },
  {
    name: "Vitamin K (newborn)",
    for: "baby",
    aka: ["vitamin k1", "phytomenadione", "konakion"],
    group: "Newborn",
    usedFor: "Given to newborns soon after birth to prevent a rare but serious bleeding problem (vitamin K deficiency bleeding).",
    notes: "Usually a single injection given by the hospital."
  },
  {
    name: "Vitamin D drops (baby)",
    for: "baby",
    aka: ["baby vitamin d", "d3 drops"],
    group: "Newborn",
    usedFor: "Supports healthy bones in breastfed babies, who may not get enough vitamin D.",
    notes: "Give exactly as the doctor says."
  },
  {
    name: "Paracetamol drops (baby)",
    for: "baby",
    aka: ["baby paracetamol", "calpol drops", "crocin drops"],
    group: "Newborn",
    usedFor: "Lowers fever or eases pain in babies, for example after vaccinations.",
    notes: "Baby doses depend on weight and age, so only give what the doctor advises. Any fever in a baby under 3 months needs a doctor."
  },
  {
    name: "Zinc (with ORS)",
    for: "baby",
    aka: ["zinc", "zinc sulphate", "zinc dispersible", "zinconia"],
    group: "Baby & child",
    usedFor: "Given to babies and children with diarrhoea, together with ORS. It helps diarrhoea get better sooner and lowers the chance of it coming back.",
    notes: "Usually given for about two weeks, even after the diarrhoea stops, at the dose the doctor or health worker advises for the child’s age."
  },
  {
    name: "Iron drops / syrup (baby)",
    for: "baby",
    aka: ["baby iron", "iron syrup", "ifa syrup", "iron drops", "tonoferon"],
    group: "Baby & child",
    usedFor: "Prevents and treats anaemia in babies and young children. India’s anaemia programme gives iron syrup to children from 6 months.",
    notes: "Too much iron is dangerous for children: keep it out of reach and give only the prescribed amount. It can darken stools."
  },
  {
    name: "Vitamin A (baby)",
    for: "baby",
    aka: ["vitamin a", "vit a"],
    group: "Baby & child",
    usedFor: "Protects against infections and eye problems. In India it is given as a dose from 9 months, then every 6 months up to 5 years.",
    notes: "Given by health workers on the national schedule, not at home unless prescribed."
  },
  {
    name: "Saline nose drops",
    for: "baby",
    aka: ["saline", "nasal saline", "nasivion saline", "sodium chloride drops"],
    group: "Baby & child",
    usedFor: "Loosens mucus and eases a blocked nose in babies, which helps them feed and sleep.",
    notes: "Plain salt-water drops. Medicated decongestant drops should only be used if a doctor prescribes them for babies."
  },
  {
    name: "Simethicone drops",
    for: "baby",
    aka: ["simethicone", "colicaid", "infacol", "gas drops"],
    group: "Baby & child",
    usedFor: "Commonly given to relieve wind (gas) in babies. Evidence that it helps colic is limited.",
    notes: "Crying that won’t settle, fever, vomiting or poor feeding needs a doctor, not just colic drops."
  },
  {
    name: "Oral thrush gel / drops",
    for: "both",
    aka: ["nystatin", "miconazole", "daktarin", "candid mouth paint", "clotrimazole mouth paint", "thrush"],
    group: "Baby & child",
    usedFor: "Treats oral thrush (white patches in a baby’s mouth). Breastfeeding mothers may also be treated for thrush on the nipples at the same time.",
    notes: "Apply exactly as prescribed. Treating mother and baby together stops it passing back and forth."
  },
  {
    name: "Antifungal nappy cream",
    for: "baby",
    aka: ["clotrimazole cream", "candid cream", "nappy rash cream", "diaper rash"],
    group: "Baby & child",
    usedFor: "Treats nappy rash caused by a yeast (fungal) infection: a red rash, often with spots at the edges.",
    notes: "Keep the area clean and dry. Ordinary nappy rash usually needs only a barrier cream; ask a doctor if it doesn’t improve."
  },
  {
    name: "Ibuprofen (baby)",
    for: "baby",
    aka: ["baby ibuprofen", "ibugesic", "brufen syrup"],
    group: "Baby & child",
    usedFor: "Lowers fever and eases pain in babies and children.",
    notes: "Usually only for babies over 3 months and above a minimum weight, at a dose based on weight. Use only if a doctor advises it."
  },
  {
    name: "Amoxicillin",
    for: "both",
    aka: ["amoxycillin", "mox", "novamox", "augmentin", "co-amoxiclav", "antibiotic"],
    group: "Baby & child",
    usedFor: "An antibiotic that treats bacterial infections, such as some chest, ear, throat or urine infections, in mothers and children.",
    notes: "Finish the full course even if feeling better. Antibiotics don’t work for colds or flu, which are viruses. Tell the doctor about any allergy or rash."
  }
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Find the guide entry for a medicine name typed by the user (matches names and other names). */
export function findMedicine(name: string): MedicineInfo | null {
  const q = norm(name);
  if (q.length < 2) return null;
  let best: { m: MedicineInfo; score: number } | null = null;
  for (const m of MEDICINE_GUIDE) {
    for (const n of [m.name, ...(m.aka ?? [])].map(norm)) {
      const score = n === q ? 3 : q.includes(n) && n.length >= 3 ? 2 : n.startsWith(q) && q.length >= 3 ? 1 : 0;
      if (score && (!best || score > best.score)) best = { m, score };
    }
  }
  return best?.m ?? null;
}
