export const ARABIC_CATEGORIES: Record<string, string[]> = {
  "فواكه": ["تفاح", "موز", "برتقال", "عنب", "مانجو", "فراولة", "بطيخ", "مليمون", "كرز", "توت"],
  "حيوانات": ["قطة", "كلب", "فيل", "أسد", "نمر", "حمار", "بقرة", "دجاجة", "سمكة", "نسر"],
  "وظائف": ["طبيب", "مهندس", "معلم", "شرطي", "طباخ", "حلاق", "نجّار", "محامي", "edBy", "مزارع"],
  "ألوان": ["أحمر", "أزرق", "أخضر", "أصفر", "أسود", "أبيض", "برتقالي", "بنفسجي", "وردي", "رمادي"],
  "悆": ["كرة", "سيف", "كتاب", "قلم", "منضدة", "كرسي", "نافذة", "باب", "ساعة", "مرآة"],
};

export const ARABIC_LETTERS = [
  "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
  "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
  "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
];

export function getCategoryWord(category: string): string | null {
  const words = ARABIC_CATEGORIES[category];
  if (!words || words.length === 0) return null;
  return words[Math.floor(Math.random() * words.length)];
}

export function getRandomCategory(): string {
  const keys = Object.keys(ARABIC_CATEGORIES);
  return keys[Math.floor(Math.random() * keys.length)];
}

export function getLettersForWord(word: string, extraCount: number = 4): string[] {
  const wordLetters = [...new Set(word.split(""))];
  const extra: string[] = [];
  while (extra.length < extraCount) {
    const rand = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    if (!wordLetters.includes(rand) && !extra.includes(rand)) {
      extra.push(rand);
    }
  }
  const all = [...wordLetters, ...extra];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}
